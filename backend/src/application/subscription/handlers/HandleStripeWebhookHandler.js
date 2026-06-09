const stripe = require('../../../config/stripe');
const {
  getSubscriptionPeriodEnd,
  resolveStripeSubscriptionId,
} = require('../../../utils/stripeSubscription');
const Subscription          = require('../../../models/sql/Subscription');
const Payment               = require('../../../models/sql/Payment');
const Plan                  = require('../../../models/sql/Plan');
const subscriptionMysqlRepo = require('../../../repositories/mysql/subscription.repo');
const paymentMysqlRepo      = require('../../../repositories/mysql/payment.repo');
const { syncSubscription, syncSubscriptionSafe } = require('../../../sync/subscriptionSync');
const { syncPaymentSafe }   = require('../../../sync/paymentSync');

// ── Helper: resolve human-readable payment method string ─────────────────────
async function resolvePaymentMethod(stripePaymentIntentId) {
  if (!stripePaymentIntentId) return 'card';
  try {
    const pi = await stripe.paymentIntents.retrieve(stripePaymentIntentId, {
      expand: ['payment_method'],
    });
    const pm = pi.payment_method;
    if (pm && typeof pm === 'object' && pm.card) {
      return `${pm.card.brand} *${pm.card.last4}`;
    }
    if (pm && typeof pm === 'object') return pm.type ?? 'card';
  } catch {
    // best-effort — don't block on this
  }
  return 'card';
}

// ── Amount/currency verification ──────────────────────────────────────────────
// Returns true only when the amount paid (in major currency units) matches
// the plan price within a $0.01 tolerance.
function amountMatchesPlan(paidAmountCents, planPrice) {
  if (!planPrice) return true; // can't verify without price — allow through
  const paidDollars = paidAmountCents / 100;
  return Math.abs(paidDollars - Number(planPrice)) < 0.01;
}

// ── Core: activate subscription after confirmed Stripe checkout ───────────────
async function activateFromCheckoutSession(session) {
  const companyId = Number(session.metadata?.companyId);
  const planId    = Number(session.metadata?.planId);
  const userId    = session.metadata?.userId ? Number(session.metadata.userId) : null;

  if (!companyId || !planId) {
    console.error('[webhook] Missing companyId or planId in session metadata');
    return;
  }

  // ── Verify plan exists ───────────────────────────────────────────────────
  const plan = await Plan.findByPk(planId);
  if (!plan) {
    console.error(`[webhook] Plan ${planId} not found — aborting activation`);
    return;
  }

  // ── Retrieve payment intent to verify amount ─────────────────────────────
  if (session.payment_intent) {
    const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
    if (!amountMatchesPlan(pi.amount, plan.price)) {
      console.error(
        `[webhook] AMOUNT MISMATCH: paid ${pi.amount / 100} ${pi.currency}, ` +
        `expected ${plan.price} for plan ${plan.name} (company ${companyId}). ` +
        `Subscription NOT activated.`
      );
      return; // do not activate — potential fraud / misconfiguration
    }
  }

  // ── Resolve Stripe subscription & period end ─────────────────────────────
  const stripeSubscriptionId = resolveStripeSubscriptionId(session.subscription);
  let currentPeriodEnd = null;

  if (session.subscription && typeof session.subscription === 'object') {
    currentPeriodEnd = getSubscriptionPeriodEnd(session.subscription);
  } else if (stripeSubscriptionId) {
    const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    currentPeriodEnd = getSubscriptionPeriodEnd(stripeSub);
  }

  // Guarantee 1-month validity even if Stripe doesn't return current_period_end
  if (!currentPeriodEnd) {
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    currentPeriodEnd = oneMonthFromNow;
  }

  // ── Upsert subscription ──────────────────────────────────────────────────
  const existing = await Subscription.findOne({ where: { companyId } });
  let sub;
  if (existing) {
    sub = await subscriptionMysqlRepo.update(existing.id, {
      planId,
      stripeSubscriptionId,
      status: 'active',
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    });
  } else {
    sub = await subscriptionMysqlRepo.create({
      companyId,
      planId,
      stripeSubscriptionId,
      status: 'active',
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    });
  }
  await syncSubscription(sub.id);

  // ── Record payment (idempotent by stripePaymentIntentId) ─────────────────
  if (session.payment_intent) {
    const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
    const exists = await Payment.findOne({ where: { stripePaymentIntentId: pi.id } });
    if (!exists) {
      const paymentMethod = await resolvePaymentMethod(pi.id);
      const payment = await paymentMysqlRepo.create({
        companyId,
        planId,
        userId:                userId || null,
        stripePaymentIntentId: pi.id,
        amount:                pi.amount / 100,
        currency:              (pi.currency ?? 'usd').toLowerCase(),
        paymentMethod,
        status:    'succeeded',
        createdAt: new Date(),
      });
      syncPaymentSafe(payment.id);
    }
  }
}

class HandleStripeWebhookHandler {
  async handle(command) {
    const { event } = command;

    switch (event.type) {
      case 'checkout.session.completed':
        await activateFromCheckoutSession(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await this._handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await this._handleInvoicePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await this._handleSubscriptionDeleted(event.data.object);
        break;

      default:
        break;
    }
  }

  async _handleInvoicePaymentSucceeded(invoice) {
    const stripeSubscriptionId = resolveStripeSubscriptionId(invoice.subscription);
    if (!stripeSubscriptionId) return;

    const sub = await Subscription.findOne({ where: { stripeSubscriptionId } });
    if (!sub) return;

    const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const currentPeriodEnd = getSubscriptionPeriodEnd(stripeSub);

    await subscriptionMysqlRepo.update(sub.id, {
      status: 'active',
      currentPeriodEnd,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    });
    syncSubscriptionSafe(sub.id);

    // Record renewal payment (idempotent)
    if (invoice.payment_intent) {
      const piId   = typeof invoice.payment_intent === 'string'
        ? invoice.payment_intent : invoice.payment_intent?.id;
      const exists = await Payment.findOne({ where: { stripePaymentIntentId: piId } });
      if (!exists) {
        const paymentMethod = await resolvePaymentMethod(piId);
        const payment = await paymentMysqlRepo.create({
          companyId:             sub.companyId,
          planId:                sub.planId,
          stripePaymentIntentId: piId,
          amount:                invoice.amount_paid / 100,
          currency:              (invoice.currency ?? 'usd').toLowerCase(),
          paymentMethod,
          status:    'succeeded',
          createdAt: new Date(),
        });
        syncPaymentSafe(payment.id);
      }
    }
  }

  async _handleInvoicePaymentFailed(invoice) {
    const stripeSubscriptionId = resolveStripeSubscriptionId(invoice.subscription);
    if (!stripeSubscriptionId) return;

    const sub = await Subscription.findOne({ where: { stripeSubscriptionId } });
    if (!sub) return;

    await subscriptionMysqlRepo.update(sub.id, { status: 'past_due' });
    syncSubscriptionSafe(sub.id);

    // Log the failed payment attempt
    if (invoice.payment_intent) {
      const piId = typeof invoice.payment_intent === 'string'
        ? invoice.payment_intent : invoice.payment_intent?.id;
      const exists = await Payment.findOne({ where: { stripePaymentIntentId: piId } });
      if (!exists) {
        const payment = await paymentMysqlRepo.create({
          companyId:             sub.companyId,
          planId:                sub.planId,
          stripePaymentIntentId: piId,
          amount:                invoice.amount_due / 100,
          currency:              (invoice.currency ?? 'usd').toLowerCase(),
          paymentMethod:         'card',
          status:                'failed',
          createdAt:             new Date(),
        });
        syncPaymentSafe(payment.id);
      }
    }
  }

  async _handleSubscriptionDeleted(stripeSub) {
    const sub = await Subscription.findOne({
      where: { stripeSubscriptionId: stripeSub.id },
    });
    if (!sub) return;

    await subscriptionMysqlRepo.update(sub.id, { status: 'cancelled' });
    syncSubscriptionSafe(sub.id);
  }
}

module.exports = new HandleStripeWebhookHandler();
module.exports.activateFromCheckoutSession = activateFromCheckoutSession;
