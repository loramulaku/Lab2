/**
 * planSync — One-time sync for Plans to MongoDB.
 * Since plans are static, run this once after seeding MySQL plans.
 */

const Plan         = require('../models/sql/Plan');
const planViewRepo = require('../repositories/mongodb/planView.repo');

async function syncAllPlans() {
  const plans = await Plan.findAll();
  for (const plan of plans) {
    await planViewRepo.upsert({
      id:       plan.id,
      name:     plan.name,
      price:    Number(plan.price),
      jobLimit: plan.jobLimit,
    });
  }
  console.log(`Synced ${plans.length} plans to MongoDB`);
}

module.exports = { syncAllPlans };