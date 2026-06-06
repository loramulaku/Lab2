const { Op }                   = require('sequelize');
const subscriptionMongoRepo    = require('../../../repositories/mongodb/subscription.repo');
const Subscription             = require('../../../models/sql/Subscription');
const Plan                     = require('../../../models/sql/Plan');
const { syncSubscriptionSafe } = require('../../../sync/subscriptionSync');

class GetMySubscriptionHandler {
  async handle(query) {
    // Primary: MongoDB read-store
    const result = await subscriptionMongoRepo.findAll(
      { companyId: query.companyId, status: { $in: ['active', 'past_due'] } },
      { limit: 1 }
    );
    if (result.data[0]) return result.data[0];

    // Fallback: MySQL (webhook may not have fired in local dev)
    const sub = await Subscription.findOne({
      where: {
        companyId: query.companyId,
        status:    { [Op.in]: ['active', 'past_due'] },
      },
      include: [{ model: Plan, as: 'Plan' }],
      order:   [['id', 'DESC']],
    });
    if (!sub) return null;

    syncSubscriptionSafe(sub.id); // catch up MongoDB asynchronously

    return {
      id:                   sub.id,
      companyId:            sub.companyId,
      planId:               sub.planId,
      stripeSubscriptionId: sub.stripeSubscriptionId,
      status:               sub.status,
      currentPeriodEnd:     sub.currentPeriodEnd,
      cancelAtPeriodEnd:    sub.cancelAtPeriodEnd,
      planName:             sub.Plan?.name    ?? null,
      planPrice:            sub.Plan?.price   ? Number(sub.Plan.price) : null,
      jobLimit:             sub.Plan?.jobLimit ?? null,
    };
  }
}

module.exports = new GetMySubscriptionHandler();
