const stripe = require('../../../config/stripe');
const {
  getSubscriptionPeriodEnd,
  resolveStripeSubscriptionId,
} = require('../../../utils/stripeSubscription');
const Subscription = require('../../../models/sql/Subscription');
const subscriptionMysqlRepo = require('../../../repositories/mysql/subscription.repo');
const paymentMysqlRepo = require('../../../repositories/mysql/payment.repo');
const { syncSubscription, syncSubscriptionSafe } = require('../../../sync/subscriptionSync');
const { syncPaymentSafe } = require('../../../sync/paymentSync');

async function activateFromCheckoutSession(session) {
  const companyId = Number(session.metadata?.companyId);
  const planId = Number(session.metadata?.planId);

  if (!companyId || !planId) return;

  const stripeSubscriptionId = resolveStripeSubscriptionId(session.subscription);
  let currentPeriodEnd = null;

  if (session.subscription && typeof session.subscription === 'object') {
    currentPeriodEnd = getSubscriptionPeriodEnd(session.subscription);
  } else if (stripeSubscriptionId) {
    const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    currentPeriodEnd = getSubscriptionPeriodEnd(stripeSub);
  }

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

  if (session.payment_intent) {
    const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
    const payment = await paymentMysqlRepo.create({
      companyId,
      stripePaymentIntentId: pi.id,
      amount: pi.amount / 100,
      status: 'succeeded',
      createdAt: new Date(),
    });
    syncPaymentSafe(payment.id);
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

    if (invoice.payment_intent) {
      const payment = await paymentMysqlRepo.create({
        companyId: sub.companyId,
        stripePaymentIntentId: invoice.payment_intent,
        amount: invoice.amount_paid / 100,
        status: 'succeeded',
        createdAt: new Date(),
      });
      syncPaymentSafe(payment.id);
    }
  }

  async _handleInvoicePaymentFailed(invoice) {
    const stripeSubscriptionId = resolveStripeSubscriptionId(invoice.subscription);
    if (!stripeSubscriptionId) return;

    const sub = await Subscription.findOne({ where: { stripeSubscriptionId } });
    if (!sub) return;

    await subscriptionMysqlRepo.update(sub.id, { status: 'past_due' });
    syncSubscriptionSafe(sub.id);
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
