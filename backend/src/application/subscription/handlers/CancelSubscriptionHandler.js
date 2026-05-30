const stripe                      = require('../../../config/stripe');
const Subscription                = require('../../../models/sql/Subscription');
const { syncSubscriptionSafe }    = require('../../../sync/subscriptionSync');

class CancelSubscriptionHandler {
  async handle(command) {
    const sub = await Subscription.findOne({
      where: { companyId: command.companyId, status: 'active' },
    });

    if (!sub) {
      const err = new Error('No active subscription found');
      err.status = 404;
      throw err;
    }

    if (sub.stripeSubscriptionId) {
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    await sub.update({ cancelAtPeriodEnd: true });
    syncSubscriptionSafe(sub.id);

    return { message: 'Subscription will be cancelled at end of billing period' };
  }
}

module.exports = new CancelSubscriptionHandler();
