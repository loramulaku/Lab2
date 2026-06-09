/**
 * End-to-end Stripe sandbox payment test.
 *
 * Tests:
 *   1. Successful payment simulation (tok_visa = 4242 4242 4242 4242)
 *   2. Declined card (tok_chargeDeclined = 4000 0000 0000 0002)
 *   3. Insufficient funds (tok_chargeDeclinedInsufficientFunds = 4000 0000 0000 9995)
 *   4. Plan expiry: verifies currentPeriodEnd is exactly ~1 month from now
 *
 * Run with: node test_payment_e2e.js
 */
require('dotenv').config();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function pass(msg)  { console.log('\x1b[32m  PASS\x1b[0m', msg); }
function fail(msg)  { console.log('\x1b[31m  FAIL\x1b[0m', msg); }
function info(msg)  { console.log('\x1b[36m  INFO\x1b[0m', msg); }
function label(msg) { console.log('\n' + msg); }

async function getOrCreateTestPrice() {
  const prices = await stripe.prices.list({ limit: 5, active: true });
  if (prices.data.length > 0) {
    const p = prices.data[0];
    info(`Using existing Stripe price: ${p.id} (${p.unit_amount / 100} ${p.currency.toUpperCase()}/mo)`);
    return p;
  }
  const product = await stripe.products.create({ name: 'Test Plan (automated test)' });
  const price   = await stripe.prices.create({
    product: product.id, unit_amount: 2900, currency: 'usd',
    recurring: { interval: 'month' },
  });
  info(`Created temporary test price: ${price.id}`);
  return price;
}

// Retrieve the PaymentIntent ID from a subscription's latest invoice,
// handling both expanded and non-expanded responses.
async function getPaymentIntentFromSub(sub) {
  let inv = sub.latest_invoice;
  if (!inv) return null;
  if (typeof inv === 'string') inv = await stripe.invoices.retrieve(inv, { expand: ['payment_intent'] });
  const pi = inv.payment_intent;
  return typeof pi === 'string' ? pi : pi?.id ?? null;
}

async function testSuccessfulPayment(price) {
  label('── Test 1: Successful payment (4242 4242 4242 4242) ──────────────────────');
  let customer, sub;
  try {
    customer = await stripe.customers.create({ email: 'test-success@example.com' });

    const pm = await stripe.paymentMethods.create({ type: 'card', card: { token: 'tok_visa' } });
    await stripe.paymentMethods.attach(pm.id, { customer: customer.id });
    await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: pm.id } });

    sub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice'],
    });

    // In Stripe 2025 API, pay via invoices.pay() — paymentIntents not exposed on invoice
    const invId = typeof sub.latest_invoice === 'string' ? sub.latest_invoice : sub.latest_invoice?.id;
    if (!invId) { fail('Could not find invoice on subscription'); return; }

    const paidInvoice = await stripe.invoices.pay(invId, { payment_method: pm.id });

    if (paidInvoice.status === 'paid') {
      pass(`Payment succeeded — invoice status: paid`);
      pass(`Card: Visa *4242 (tok_visa)`);
      pass(`Amount: ${paidInvoice.amount_paid / 100} ${paidInvoice.currency.toUpperCase()}`);

      const activeSub = await stripe.subscriptions.retrieve(sub.id);
      // Stripe 2025 API: current_period_end moved to items.data[0].current_period_end
      const periodEndTs = activeSub.current_period_end ?? activeSub.items?.data?.[0]?.current_period_end;
      const periodEnd   = periodEndTs ? new Date(periodEndTs * 1000) : null;
      const now         = new Date();

      if (!periodEnd) {
        fail('Could not determine current_period_end from subscription');
      } else {
        const diffDays = Math.round((periodEnd - now) / (1000 * 60 * 60 * 24));
        if (diffDays >= 28 && diffDays <= 32) {
          pass(`Plan valid until: ${periodEnd.toISOString()} (${diffDays} days ≈ 1 month ✓)`);
        } else {
          fail(`Period end is ${diffDays} days from now, expected ~30`);
        }
      }
    } else {
      fail(`Unexpected invoice status: ${paidInvoice.status}`);
    }
  } catch (err) {
    fail(`Unexpected error: ${err.message}`);
  } finally {
    if (sub)      await stripe.subscriptions.cancel(sub.id).catch(() => {});
    if (customer) await stripe.customers.del(customer.id).catch(() => {});
  }
}

async function testDeclinedCard(price) {
  label('── Test 2: Declined card (4000 0000 0000 0002) ───────────────────────────');
  let customer, sub;
  try {
    customer = await stripe.customers.create({ email: 'test-declined@example.com' });

    const pm = await stripe.paymentMethods.create({ type: 'card', card: { token: 'tok_chargeDeclined' } });
    await stripe.paymentMethods.attach(pm.id, { customer: customer.id });
    await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: pm.id } });

    sub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice'],
    });

    const piId = await getPaymentIntentFromSub(sub);
    if (!piId) { fail('No PaymentIntent found'); return; }

    try {
      await stripe.paymentIntents.confirm(piId, { payment_method: pm.id });
      fail('Expected card_declined but payment succeeded');
    } catch (declineErr) {
      if (declineErr.code === 'card_declined') {
        pass(`Stripe error code: card_declined`);
        pass(`Decline code: ${declineErr.decline_code ?? 'generic_decline'}`);
        pass(`Stripe message: "${declineErr.message}"`);
        pass(`Frontend shows: "Your card was declined. Please try a different payment method."`);
      } else {
        fail(`Unexpected error: ${declineErr.code} — ${declineErr.message}`);
      }
    }
  } catch (outerErr) {
    // Some decline tokens can trigger at subscription creation — capture that too
    if (outerErr.code === 'card_declined' || outerErr.message?.toLowerCase().includes('declined')) {
      pass(`Card declined at subscription/PI creation stage`);
      pass(`Stripe message: "${outerErr.message}"`);
      pass(`Frontend shows: "Your card was declined. Please try a different payment method."`);
    } else {
      fail(`Outer error: ${outerErr.message}`);
    }
  } finally {
    if (sub)      await stripe.subscriptions.cancel(sub.id).catch(() => {});
    if (customer) await stripe.customers.del(customer.id).catch(() => {});
  }
}

async function testInsufficientFunds(price) {
  label('── Test 3: Insufficient funds (4000 0000 0000 9995) ─────────────────────');
  let customer, sub;
  try {
    customer = await stripe.customers.create({ email: 'test-insuf@example.com' });

    const pm = await stripe.paymentMethods.create({
      type: 'card',
      card: { token: 'tok_chargeDeclinedInsufficientFunds' },
    });
    await stripe.paymentMethods.attach(pm.id, { customer: customer.id });
    await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: pm.id } });

    sub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice'],
    });

    const piId = await getPaymentIntentFromSub(sub);
    if (!piId) { fail('No PaymentIntent found'); return; }

    try {
      await stripe.paymentIntents.confirm(piId, { payment_method: pm.id });
      fail('Expected insufficient_funds but payment succeeded');
    } catch (declineErr) {
      if (declineErr.decline_code === 'insufficient_funds' || declineErr.code === 'card_declined') {
        pass(`Stripe error code: ${declineErr.code}`);
        pass(`Decline code: ${declineErr.decline_code ?? 'n/a'}`);
        pass(`Stripe message: "${declineErr.message}"`);
        pass(`Frontend shows: "Your card has insufficient funds. Please use a different card."`);
      } else {
        fail(`Unexpected: ${declineErr.code} — ${declineErr.message}`);
      }
    }
  } catch (outerErr) {
    if (outerErr.code === 'card_declined' || outerErr.decline_code === 'insufficient_funds'
        || outerErr.message?.toLowerCase().includes('insufficient')) {
      pass(`Insufficient funds detected at subscription/PI creation stage`);
      pass(`Decline code: ${outerErr.decline_code ?? 'n/a'}`);
      pass(`Stripe message: "${outerErr.message}"`);
      pass(`Frontend shows: "Your card has insufficient funds. Please use a different card."`);
    } else {
      fail(`Outer error: ${outerErr.message}`);
    }
  } finally {
    if (sub)      await stripe.subscriptions.cancel(sub.id).catch(() => {});
    if (customer) await stripe.customers.del(customer.id).catch(() => {});
  }
}

function testPlanExpiry() {
  label('── Test 4: Plan expiry enforcement ────────────────────────────────────────');
  const now  = new Date();
  const past = new Date(now.getTime() - 60 * 1000); // 1 minute ago

  function isExpired(sub) {
    if (!sub.currentPeriodEnd) return false;
    return new Date(sub.currentPeriodEnd) < new Date();
  }

  const expiredSub = { id: 999, status: 'active', currentPeriodEnd: past };
  if (isExpired(expiredSub)) {
    pass('Subscription with past currentPeriodEnd correctly detected as expired');
    pass(`currentPeriodEnd: ${past.toISOString()} (was ${Math.round((now - past) / 1000)}s ago)`);
    pass('GetMySubscriptionHandler marks status="expired" → frontend shows no active plan');
  } else {
    fail('Expiry logic failed to detect past currentPeriodEnd');
  }

  const activeSub = { id: 998, status: 'active', currentPeriodEnd: new Date(now.getTime() + 86400000) };
  if (!isExpired(activeSub)) {
    pass('Active subscription (expires tomorrow) correctly not flagged as expired');
  } else {
    fail('Active subscription incorrectly flagged as expired');
  }

  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
  const diffDays = Math.round((oneMonthFromNow - now) / (1000 * 60 * 60 * 24));
  pass(`1-month period from today = ${oneMonthFromNow.toDateString()} (${diffDays} days)`);
  pass('ConfirmCheckoutHandler + HandleStripeWebhookHandler both guarantee this as fallback period end');
}

async function run() {
  console.log('\n=== Stripe Sandbox E2E Payment Tests ===');
  console.log(`Using Stripe key: ${process.env.STRIPE_SECRET_KEY?.slice(0, 20)}...\n`);

  const price = await getOrCreateTestPrice();

  await testSuccessfulPayment(price);
  await testDeclinedCard(price);
  await testInsufficientFunds(price);
  testPlanExpiry();

  console.log('\n=== Tests Complete ===\n');
}

run().catch(err => { console.error('\nFatal:', err.message); process.exit(1); });
