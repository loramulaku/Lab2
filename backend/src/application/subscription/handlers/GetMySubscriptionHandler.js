const { Op }                   = require('sequelize');
const subscriptionMongoRepo    = require('../../../repositories/mongodb/subscription.repo');
const Subscription             = require('../../../models/sql/Subscription');
const Plan                     = require('../../../models/sql/Plan');
const subscriptionMysqlRepo    = require('../../../repositories/mysql/subscription.repo');
const { syncSubscriptionSafe } = require('../../../sync/subscriptionSync');

// A subscription is expired when currentPeriodEnd is in the past.
// Stripe normally sends a webhook to set status='cancelled' at period end,
// but this local guard handles the case where the webhook hasn't arrived yet.
function isExpired(sub) {
  if (!sub.currentPeriodEnd) return false;
  return new Date(sub.currentPeriodEnd) < new Date();
}

// If we detect expiry locally, sync the status to the DB so the next query
// picks it up without needing a Stripe webhook.
async function markExpiredIfNeeded(sub) {
  if (sub.status !== 'active') return sub;
  if (!isExpired(sub)) return sub;
  const id = sub._id ?? sub.id;
  if (id) {
    await subscriptionMysqlRepo.update(id, { status: 'expired' }).catch(() => {});
    syncSubscriptionSafe(id);
  }
  return { ...sub, status: 'expired' };
}

class GetMySubscriptionHandler {
  async handle(query) {
    // Primary: MongoDB read-store
    const result = await subscriptionMongoRepo.findAll(
      { companyId: query.companyId, status: { $in: ['active', 'past_due'] } },
      { limit: 1 }
    );
    if (result.data[0]) {
      const sub = result.data[0];
      if (isExpired(sub)) return markExpiredIfNeeded(sub);
      return sub;
    }

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

    const row = {
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

    return markExpiredIfNeeded(row);
  }
}

module.exports = new GetMySubscriptionHandler();
