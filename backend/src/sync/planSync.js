const Plan       = require('../models/sql/Plan');
const FailedSync = require('../models/sql/FailedSync');
const planMongoRepo = require('../repositories/mongodb/plan.repo');

async function syncPlan(planId) {
  const plan = await Plan.findByPk(planId);
  if (!plan) {
    await planMongoRepo.delete(planId);
    return;
  }
  await planMongoRepo.upsert({
    id:           plan.id,
    name:         plan.name,
    price:        plan.price ? Number(plan.price) : 0,
    billingInterval: plan.billingInterval ?? 'month',
    jobLimit:     plan.jobLimit,
    stripePriceId:plan.stripePriceId,
    isActive:     plan.isActive,
  });
  await FailedSync.destroy({ where: { entityType: 'plan', entityId: planId } });
}

function syncPlanSafe(planId) {
  syncPlan(planId).catch(async (err) => {
    console.error(`[planSync] Failed to sync planId=${planId}:`, err.message);
    try {
      const [record, created] = await FailedSync.findOrCreate({
        where: { entityType: 'plan', entityId: planId },
        defaults: {
          entityType:      'plan',
          entityId:        planId,
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
      console.error('[planSync] Could not write to FailedSyncs:', dbErr.message);
    }
  });
}

module.exports = { syncPlan, syncPlanSafe };
