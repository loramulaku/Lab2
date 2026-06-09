const stripe                   = require('../../../config/stripe');
const Subscription             = require('../../../models/sql/Subscription');
const Payment                  = require('../../../models/sql/Payment');
const Plan                     = require('../../../models/sql/Plan');
const subscriptionMysqlRepo    = require('../../../repositories/mysql/subscription.repo');
const paymentMysqlRepo         = require('../../../repositories/mysql/payment.repo');
const { syncSubscription }     = require('../../../sync/subscriptionSync');
const { syncPaymentSafe }      = require('../../../sync/paymentSync');

class ConfirmCheckoutHandler {
  async handle(command) {
    // Expand subscription + its latest invoice so we can get the payment intent
    const session = await stripe.checkout.sessions.retrieve(command.sessionId, {
      expand: ['subscription', 'subscription.latest_invoice'],
    });

    if (session.payment_status !== 'paid') {
      const err = new Error('Payment not completed');
      err.status = 400;
      throw err;
    }

    const companyId = Number(session.metadata?.companyId);
    const planId    = Number(session.metadata?.planId);
    if (!companyId || !planId) {
      const err = new Error('Invalid session metadata — companyId or planId missing');
      err.status = 400;
      throw err;
    }

    // ── Resolve Stripe subscription & period end ─────────────────────────────
    const stripeSubscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id ?? null;

    let currentPeriodEnd = null;
    let latestInvoice    = null;

    if (session.subscription && typeof session.subscription === 'object') {
      currentPeriodEnd = session.subscription.current_period_end
        ? new Date(session.subscription.current_period_end * 1000)
        : null;
      latestInvoice = session.subscription.latest_invoice ?? null;
    } else if (stripeSubscriptionId) {
      const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
        expand: ['latest_invoice'],
      });
      currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
      latestInvoice    = stripeSub.latest_invoice ?? null;
    }

    // Fallback: if Stripe didn't give us a period end, calculate exactly 1 month
    // from now. This ensures plan validity is always exactly 1 calendar month.
    if (!currentPeriodEnd) {
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      currentPeriodEnd = oneMonthFromNow;
    }

    // ── Upsert subscription in MySQL ─────────────────────────────────────────
    const existing = await Subscription.findOne({ where: { companyId } });

    let sub;
    if (existing) {
      await subscriptionMysqlRepo.update(existing.id, {
        planId,
        stripeSubscriptionId,
        status:            'active',
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
      });
      sub = await Subscription.findByPk(existing.id, { include: [{ model: Plan, as: 'Plan' }] });
    } else {
      const created = await subscriptionMysqlRepo.create({
        companyId,
        planId,
        stripeSubscriptionId,
        status:            'active',
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
      });
      sub = await Subscription.findByPk(created.id, { include: [{ model: Plan, as: 'Plan' }] });
    }

    // Sync subscription to MongoDB synchronously
    await syncSubscription(sub.id);

    // ── Record payment (idempotent by stripePaymentIntentId) ─────────────────
    // For subscription mode, the payment intent lives on the latest invoice.
    // For one-time mode it lives directly on the session.
    let paymentIntentId = session.payment_intent ?? null;
    let amountPaid      = session.amount_total ? session.amount_total / 100 : null;

    if (!paymentIntentId && latestInvoice) {
      const inv = typeof latestInvoice === 'string'
        ? await stripe.invoices.retrieve(latestInvoice)
        : latestInvoice;
      paymentIntentId = typeof inv.payment_intent === 'string'
        ? inv.payment_intent
        : inv.payment_intent?.id ?? null;
      if (!amountPaid && inv.amount_paid) amountPaid = inv.amount_paid / 100;
    }

    if (paymentIntentId) {
      // Avoid duplicate payment records if confirmCheckout is called twice
      const exists = await Payment.findOne({ where: { stripePaymentIntentId: paymentIntentId } });
      if (!exists) {
        const payment = await paymentMysqlRepo.create({
          companyId,
          stripePaymentIntentId: paymentIntentId,
          amount:    amountPaid ?? sub.Plan?.price ?? null,
          status:    'succeeded',
          createdAt: new Date(),
        });
        syncPaymentSafe(payment.id);
      }
    }

    return {
      id:                sub.id,
      companyId,
      planId:            sub.planId,
      status:            sub.status,
      planName:          sub.Plan?.name    ?? null,
      planPrice:         sub.Plan?.price   ? Number(sub.Plan.price) : null,
      jobLimit:          sub.Plan?.jobLimit ?? null,
      currentPeriodEnd:  sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    };
  }
}

module.exports = new ConfirmCheckoutHandler();
