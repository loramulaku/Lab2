const stripe        = require('../../../config/stripe');
const planMysqlRepo  = require('../../../repositories/mysql/plan.repo');
const { syncPlanSafe } = require('../../../sync/planSync');

class DeletePlanHandler {
  async handle(command) {
    const existing = await planMysqlRepo.findById(command.id);
    if (!existing) {
      const err = new Error('Plan not found');
      err.status = 404;
      throw err;
    }

    if (existing.stripePriceId) {
      await stripe.prices.update(existing.stripePriceId, { active: false });
    }

    await planMysqlRepo.update(command.id, { isActive: false });
    syncPlanSafe(command.id);
    return { message: 'Plan deactivated' };
  }
}

module.exports = new DeletePlanHandler();
