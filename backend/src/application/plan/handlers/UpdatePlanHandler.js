const stripe        = require('../../../config/stripe');
const planMysqlRepo  = require('../../../repositories/mysql/plan.repo');
const { syncPlanSafe } = require('../../../sync/planSync');

class UpdatePlanHandler {
  async handle(command) {
    const existing = await planMysqlRepo.findById(command.id);
    if (!existing) {
      const err = new Error('Plan not found');
      err.status = 404;
      throw err;
    }

    let stripePriceId = existing.stripePriceId;

    if (command.price != null && Number(command.price) !== Number(existing.price)) {
      await stripe.prices.update(existing.stripePriceId, { active: false });

      const newStripePrice = await stripe.prices.create({
        product:     (await stripe.prices.retrieve(existing.stripePriceId)).product,
        unit_amount: Math.round(Number(command.price) * 100),
        currency:    'usd',
        recurring:   { interval: 'month' },
      });
      stripePriceId = newStripePrice.id;
    }

    const updates = {};
    if (command.name     !== undefined) updates.name         = command.name;
    if (command.price    !== undefined) updates.price        = command.price;
    if (command.jobLimit !== undefined) updates.jobLimit     = command.jobLimit;
    updates.stripePriceId = stripePriceId;

    const plan = await planMysqlRepo.update(command.id, updates);
    syncPlanSafe(command.id);
    return plan;
  }
}

module.exports = new UpdatePlanHandler();
