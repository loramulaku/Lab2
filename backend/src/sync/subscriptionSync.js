/**
 * subscriptionSync — CQRS read-side projection for Subscriptions.
 *
 * Called after every MySQL write that changes a Subscription.
 * Fetches the full, denormalized subscription state from MySQL and upserts
 * it into the MongoDB SubscriptionView collection so the read side is always
 * up to date without hitting the relational DB on queries.
 *
 * Flow:
 *   MySQL write (Subscription)
 *     └─► syncSubscription(subscriptionId)
 *           ├─ SELECT Subscription + Company + Plan  (MySQL)
 *           └─ SubscriptionView.findOneAndUpdate({ subscriptionId }, $set, { upsert: true })  (MongoDB)
 */

const Subscription = require('../models/sql/Subscription');
const Company      = require('../models/sql/Company');
const Plan         = require('../models/sql/Plan');
const subscriptionViewRepo = require('../repositories/mongodb/subscriptionView.repo');

/**
 * Build and upsert the MongoDB read projection for one subscription.
 *
 * @param {number} subscriptionId
 * @returns {Promise<void>}
 */
async function syncSubscription(subscriptionId) {
  // 1. Core subscription row
  const subscription = await Subscription.findByPk(subscriptionId);
  if (!subscription) {
    // Subscription deleted — remove from read store
    await subscriptionViewRepo.delete(subscriptionId);
    return;
  }

  // 2. Owning company (denormalised snapshot)
  const company = subscription.companyId
    ? await Company.findByPk(subscription.companyId)
    : null;

  // 3. Associated plan (denormalised snapshot)
  const plan = subscription.planId
    ? await Plan.findByPk(subscription.planId)
    : null;

  // 4. Upsert MongoDB projection  (_id = MySQL subscription.id)
  await subscriptionViewRepo.upsert({
    id:                  subscription.id,
    companyId:           subscription.companyId,
    planId:              subscription.planId,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    status:              subscription.status,
    currentPeriodEnd:    subscription.currentPeriodEnd,
    // ── denormalised from Companies + Plans ──
    companyName: company ? company.name : null,
    planName:    plan ? plan.name : null,
    planPrice:   plan ? Number(plan.price) : null,
  });
}

module.exports = { syncSubscription };