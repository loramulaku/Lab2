const Subscription       = require('../models/sql/Subscription');
const Company            = require('../models/sql/Company');
const Plan               = require('../models/sql/Plan');
const FailedSync         = require('../models/sql/FailedSync');
const subscriptionMongoRepo = require('../repositories/mongodb/subscription.repo');

async function syncSubscription(subscriptionId) {
  const sub = await Subscription.findByPk(subscriptionId);
  if (!sub) {
    await subscriptionMongoRepo.delete(subscriptionId);
    return;
  }

  const company = sub.companyId ? await Company.findByPk(sub.companyId) : null;
  const plan    = sub.planId    ? await Plan.findByPk(sub.planId)        : null;

  await subscriptionMongoRepo.upsert({
    id:                   sub.id,
    companyId:            sub.companyId,
    planId:               sub.planId,
    stripeSubscriptionId: sub.stripeSubscriptionId,
    status:               sub.status,
    currentPeriodEnd:     sub.currentPeriodEnd,
    cancelAtPeriodEnd:    sub.cancelAtPeriodEnd,
    companyName:          company?.name ?? null,
    planName:             plan?.name    ?? null,
    planPrice:            plan?.price   ? Number(plan.price) : null,
    planInterval:         plan?.billingInterval ?? 'month',
    jobLimit:             plan?.jobLimit ?? null,
  });

  await FailedSync.destroy({ where: { entityType: 'subscription', entityId: subscriptionId } });
}

function syncSubscriptionSafe(subscriptionId) {
  syncSubscription(subscriptionId).catch(async (err) => {
    console.error(`[subscriptionSync] Failed to sync subscriptionId=${subscriptionId}:`, err.message);
    try {
      const [record, created] = await FailedSync.findOrCreate({
        where: { entityType: 'subscription', entityId: subscriptionId },
        defaults: {
          entityType:      'subscription',
          entityId:        subscriptionId,
          errorMessage:    err.message,
          attempts:        1,
          lastAttemptedAt: new Date(),
          createdAt:       new Date(),
        },
      });
      if (!created) {
        await record.update({
          errorMessage:    err.message,
          attempts:        record.attempts + 1,
          lastAttemptedAt: new Date(),
          resolvedAt:      null,
        });
      }
    } catch (dbErr) {
      console.error('[subscriptionSync] Could not write to FailedSyncs:', dbErr.message);
    }
  });
}

module.exports = { syncSubscription, syncSubscriptionSafe };
