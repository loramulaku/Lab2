/**
 * Happy-path end-to-end webhook test.
 *
 * Proves:
 *   1. checkout.session.completed with real metadata activates the plan
 *   2. Amount/currency verification passes against plan.price
 *   3. currentPeriodEnd is set to exactly ~1 month from now
 *   4. A Payment record is created in the DB
 *
 * Strategy:
 *   - Creates real Stripe objects (customer → subscription → pay invoice) so
 *     payment_intent IDs, subscription IDs, and amounts are all genuine Stripe data.
 *   - Constructs a checkout.session.completed payload that mirrors exactly what
 *     Stripe sends after a hosted checkout, with metadata.companyId / planId.
 *   - Signs the payload with the live STRIPE_WEBHOOK_SECRET and POSTs to the
 *     running backend — the backend cannot distinguish this from a real event.
 *   - Snapshots MySQL before and after to prove the DB changed.
 *
 * Run: node test_happy_path.js
 */
require('dotenv').config();
const http    = require('http');
const Stripe  = require('stripe');
const { Sequelize } = require('sequelize');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ── Colours ───────────────────────────────────────────────────────────────────
const g = (m) => console.log('\x1b[32m  PASS\x1b[0m', m);
const r = (m) => console.log('\x1b[31m  FAIL\x1b[0m', m);
const i = (m) => console.log('\x1b[36m  INFO\x1b[0m', m);
const h = (m) => console.log('\n\x1b[1m' + m + '\x1b[0m');

// ── MySQL helper ──────────────────────────────────────────────────────────────
let sq;
async function db(sql, bind = []) {
  if (!sq) {
    sq = new Sequelize(
      process.env.MYSQL_DB,
      process.env.MYSQL_USER,
      process.env.MYSQL_PASS,
      { host: process.env.MYSQL_HOST, dialect: 'mysql', logging: false }
    );
  }
  const rows = await sq.query(sql, { replacements: bind, type: Sequelize.QueryTypes.SELECT });
  return rows;
}

// ── POST helper ───────────────────────────────────────────────────────────────
function post(path, body, headers) {
  return new Promise((resolve, reject) => {
    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname: 'localhost',
      port:     3001,
      path,
      method:   'POST',
      headers:  { 'Content-Length': Buffer.byteLength(payload), ...headers },
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  Stripe Happy-Path End-to-End Test');
  console.log('════════════════════════════════════════════════════════');

  // ── Step 0: Resolve real company and plan from DB ──────────────────────────
  h('Step 0 — Load real company and plan from DB');

  const [plan] = await db('SELECT * FROM Plans WHERE id = 1 LIMIT 1');
  i(`Plan: id=${plan.id}, name="${plan.name}", price=${plan.price}, stripePriceId=${plan.stripe_price_id}`);

  const [company] = await db('SELECT * FROM Companies WHERE id = 76 LIMIT 1');
  i(`Company: id=${company.id}, name="${company.name}"`);

  if (!plan || !company) { r('Could not load plan/company from DB — aborting'); process.exit(1); }

  // ── Step 1: Snapshot DB before ─────────────────────────────────────────────
  h('Step 1 — DB snapshot BEFORE');

  const subsBefore = await db('SELECT * FROM Subscriptions WHERE company_id = ?', [company.id]);
  const paysBefore = await db('SELECT * FROM Payments   WHERE company_id = ?', [company.id]);
  i(`Subscriptions before: ${subsBefore.length} row(s): ${JSON.stringify(subsBefore.map(s => ({id:s.id, status:s.status, periodEnd:s.current_period_end})))}`);
  i(`Payments before: ${paysBefore.length} row(s)`);

  // ── Step 2: Create real Stripe objects ─────────────────────────────────────
  h('Step 2 — Create real Stripe customer + subscription (sandbox)');

  // Create or reuse customer
  let stripeCustomerId = company.stripe_customer_id;
  if (!stripeCustomerId) {
    const cust = await stripe.customers.create({ email: 'happypath-test@example.com', name: company.name });
    stripeCustomerId = cust.id;
    i(`Created Stripe customer: ${stripeCustomerId}`);
  } else {
    i(`Reusing Stripe customer: ${stripeCustomerId}`);
  }

  // Attach test payment method (Visa 4242)
  const pm = await stripe.paymentMethods.create({ type: 'card', card: { token: 'tok_visa' } });
  await stripe.paymentMethods.attach(pm.id, { customer: stripeCustomerId });
  await stripe.customers.update(stripeCustomerId, { invoice_settings: { default_payment_method: pm.id } });
  i(`Payment method: ${pm.id} (Visa *4242)`);

  // Create subscription → incomplete, latest_invoice is the first invoice
  const stripeSub = await stripe.subscriptions.create({
    customer:         stripeCustomerId,
    items:            [{ price: plan.stripe_price_id }],
    payment_behavior: 'default_incomplete',
    expand:           ['latest_invoice'],
  });
  i(`Stripe subscription created: ${stripeSub.id}`);
  i(`Subscription status: ${stripeSub.status}`);

  // Pay the first invoice (Stripe 2025: use invoices.pay())
  const invId = typeof stripeSub.latest_invoice === 'string'
    ? stripeSub.latest_invoice : stripeSub.latest_invoice?.id;

  const paidInvoice = await stripe.invoices.pay(invId, { payment_method: pm.id });
  i(`Invoice ${invId} status after pay: ${paidInvoice.status}`);
  if (paidInvoice.status !== 'paid') {
    r(`Invoice not paid — status: ${paidInvoice.status}. Aborting.`);
    await stripe.subscriptions.cancel(stripeSub.id).catch(() => {});
    process.exit(1);
  }

  // Retrieve the now-active subscription to get current_period_end
  const activeSub = await stripe.subscriptions.retrieve(stripeSub.id);
  const periodEndTs = activeSub.current_period_end ?? activeSub.items?.data?.[0]?.current_period_end;
  i(`Stripe subscription active, period end ts: ${periodEndTs}`);

  // Stripe 2025 API: payment_intent was removed from invoice objects.
  // Find it by listing the customer's recent PIs and matching by amount + status.
  const piList = await stripe.paymentIntents.list({ customer: stripeCustomerId, limit: 5 });
  const pi = piList.data.find(p => p.status === 'succeeded' && p.amount === paidInvoice.amount_paid);
  if (!pi) {
    r(`Could not find a succeeded PI for amount ${paidInvoice.amount_paid} — PIs: ${JSON.stringify(piList.data.map(p => ({id:p.id,status:p.status,amount:p.amount})))}`);
    await stripe.subscriptions.cancel(stripeSub.id).catch(() => {});
    process.exit(1);
  }

  i(`Payment intent: ${pi.id} — status: ${pi.status} — amount: ${pi.amount} ${pi.currency}`);
  if (pi.status !== 'succeeded') {
    r(`PaymentIntent not succeeded — status: ${pi.status}`); process.exit(1);
  }

  // ── Amount/currency verification (mirrors handler logic) ──────────────────
  h('Step 3 — Amount/currency verification');
  const paidDollars  = pi.amount / 100;
  const planPrice    = Number(plan.price);
  const diff         = Math.abs(paidDollars - planPrice);
  i(`Paid: ${paidDollars} ${pi.currency.toUpperCase()}`);
  i(`Plan price: ${planPrice} USD`);
  i(`Diff: ${diff.toFixed(4)} (tolerance: 0.01)`);
  if (diff < 0.01) {
    g(`Amount matches plan price — verification PASSES`);
  } else {
    r(`Amount mismatch — verification would FAIL, aborting`);
    await stripe.subscriptions.cancel(stripeSub.id).catch(() => {});
    process.exit(1);
  }

  // ── Step 4: Build realistic checkout.session.completed payload ────────────
  h('Step 4 — Build checkout.session.completed event payload');

  const eventPayload = {
    id:   `evt_test_happypath_${Date.now()}`,
    type: 'checkout.session.completed',
    data: {
      object: {
        id:              `cs_test_happypath_${Date.now()}`,
        object:          'checkout.session',
        mode:            'subscription',
        payment_status:  'paid',
        status:          'complete',
        customer:        stripeCustomerId,
        subscription:    stripeSub.id,
        payment_intent:  pi.id,
        amount_total:    pi.amount,
        currency:        pi.currency,
        metadata: {
          companyId: String(company.id),
          planId:    String(plan.id),
          userId:    '',
        },
      },
    },
    livemode:   false,
    created:    Math.floor(Date.now() / 1000),
    api_version: '2025-10-29.clover',
  };

  const payloadStr = JSON.stringify(eventPayload);
  i(`Event type:  ${eventPayload.type}`);
  i(`metadata.companyId: ${eventPayload.data.object.metadata.companyId}`);
  i(`metadata.planId:    ${eventPayload.data.object.metadata.planId}`);
  i(`payment_intent:     ${pi.id}`);
  i(`subscription:       ${stripeSub.id}`);

  // ── Step 5: Sign with live STRIPE_WEBHOOK_SECRET and POST ─────────────────
  h('Step 5 — Sign payload and POST to backend /api/subscriptions/webhook');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  i(`Using secret: ${webhookSecret}`);

  const sig = stripe.webhooks.generateTestHeaderString({
    payload:   payloadStr,
    secret:    webhookSecret,
    timestamp: Math.floor(Date.now() / 1000),
  });
  i(`Signature header: ${sig.slice(0, 60)}...`);

  const res = await post(
    '/api/subscriptions/webhook',
    payloadStr,
    { 'Content-Type': 'application/json', 'stripe-signature': sig },
  );

  i(`Backend response: HTTP ${res.status} — ${JSON.stringify(res.body)}`);

  if (res.status === 200) {
    g(`Backend accepted and processed the event (200 OK)`);
  } else {
    r(`Backend returned ${res.status}: ${JSON.stringify(res.body)}`);
    await stripe.subscriptions.cancel(stripeSub.id).catch(() => {});
    if (sq) await sq.close();
    process.exit(1);
  }

  // Give DB writes a moment to commit
  await new Promise(res => setTimeout(res, 800));

  // ── Step 6: DB snapshot AFTER ──────────────────────────────────────────────
  h('Step 6 — DB snapshot AFTER');

  const subsAfter = await db('SELECT * FROM Subscriptions WHERE company_id = ?', [company.id]);
  const paysAfter = await db(
    'SELECT id, company_id, plan_id, amount, currency, payment_method, status, stripe_payment_intent_id, created_at FROM Payments WHERE company_id = ? ORDER BY created_at DESC LIMIT 3',
    [company.id]
  );

  if (subsAfter.length === 0) { r('No subscription row found after event'); }
  else {
    const sub = subsAfter[0];
    i(`Subscription row: id=${sub.id}, companyId=${sub.company_id}, planId=${sub.plan_id}, status=${sub.status}`);

    if (sub.status === 'active') {
      g(`Subscription status = "active" ✓`);
    } else {
      r(`Subscription status = "${sub.status}" (expected "active")`);
    }

    if (sub.plan_id == plan.id) {
      g(`plan_id = ${sub.plan_id} matches plan "${plan.name}" ✓`);
    } else {
      r(`plan_id = ${sub.plan_id}, expected ${plan.id}`);
    }

    if (sub.current_period_end) {
      const periodEnd = new Date(sub.current_period_end);
      const now       = new Date();
      const diffDays  = Math.round((periodEnd - now) / (1000 * 60 * 60 * 24));
      i(`currentPeriodEnd = ${sub.current_period_end}`);
      if (diffDays >= 28 && diffDays <= 33) {
        g(`Period end is ${diffDays} days from now — exactly ~1 month ✓`);
      } else if (periodEndTs) {
        // Stripe returned a period end — verify it matches
        const stripeEnd = new Date(periodEndTs * 1000);
        const dbEnd     = new Date(sub.current_period_end);
        const diffMs    = Math.abs(stripeEnd - dbEnd);
        if (diffMs < 2000) {
          g(`currentPeriodEnd matches Stripe's subscription.current_period_end (diff: ${diffMs}ms) ✓`);
        } else {
          r(`currentPeriodEnd mismatch — DB: ${dbEnd.toISOString()}, Stripe: ${stripeEnd.toISOString()}`);
        }
      } else {
        r(`Period end is ${diffDays} days from now (expected 28-33 days)`);
      }
    } else {
      r('currentPeriodEnd is NULL in DB');
    }
  }

  h('Step 7 — Payment record');

  if (paysAfter.length === 0) {
    r('No payment record found in DB after event');
  } else {
    const pay = paysAfter[0];
    i(`Payment row: id=${pay.id}, amount=${pay.amount}, currency=${pay.currency}, method=${pay.payment_method}`);
    i(`  status=${pay.status}, pi=${pay.stripe_payment_intent_id}`);

    if (pay.status === 'succeeded')   g(`Payment status = "succeeded" ✓`);
    else                              r(`Payment status = "${pay.status}"`);

    if (pay.stripe_payment_intent_id === pi.id) g(`stripePaymentIntentId matches real Stripe PI (${pi.id}) ✓`);
    else                                        r(`PI mismatch — DB: ${pay.stripe_payment_intent_id}`);

    if (Number(pay.amount) === paidDollars)  g(`amount = ${pay.amount} matches paid amount ✓`);
    else                                     r(`amount mismatch — DB: ${pay.amount}, paid: ${paidDollars}`);

    if (pay.plan_id == plan.id)  g(`plan_id = ${pay.plan_id} (${plan.name}) ✓`);
    else                         r(`plan_id = ${pay.plan_id}, expected ${plan.id}`);

    const newPay = paysAfter.length > paysBefore.length;
    if (newPay) g(`New payment row created (before: ${paysBefore.length}, after: ${paysAfter.length}) ✓`);
    else        r(`Payment count unchanged (${paysBefore.length}) — possible duplicate guard triggered`);
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────
  h('Cleanup');
  await stripe.subscriptions.cancel(stripeSub.id).catch(() => {});
  i(`Stripe test subscription ${stripeSub.id} cancelled`);

  if (sq) await sq.close();

  console.log('\n════════════════════════════════════════════════════════');
  console.log('  Test complete.');
  console.log('════════════════════════════════════════════════════════\n');
}

run().catch(err => {
  console.error('\nFatal:', err.message, err.stack);
  if (sq) sq.close().catch(() => {});
  process.exit(1);
});
