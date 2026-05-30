const stripe       = require('../../../config/stripe');
const planMysqlRepo = require('../../../repositories/mysql/plan.repo');
const { syncPlanSafe } = require('../../../sync/planSync');

class CreatePlanHandler {
  async handle(command) {
    const product = await stripe.products.create({ name: command.name });

    const stripePrice = await stripe.prices.create({
      product:    product.id,
      unit_amount: Math.round(command.price * 100),
      currency:   'usd',
      recurring:  { interval: 'month' },
    });

    const plan = await planMysqlRepo.create({
      name:         command.name,
      price:        command.price,
      jobLimit:     command.jobLimit,
      stripePriceId:stripePrice.id,
      isActive:     true,
    });

    syncPlanSafe(plan.id);
    return plan;
  }
}

module.exports = new CreatePlanHandler();
