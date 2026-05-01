const { sequelize } = require('../../config/mysql');
const planRepo      = require('../../repositories/mysql/plan.repo');
const Subscription  = require('../../models/sql/Subscription');
const Payment       = require('../../models/sql/Payment');

class SubscribeToPlanHandler {
  /**
   * @param {import('../commands/SubscribeToPlan.command')} command
   * @returns {Promise<{ subscription: object, payment: object }>}
   */
  async handle(command) {
    const plan = await planRepo.findById(command.planId);
    if (!plan) {
      const err = new Error('Plan not found');
      err.status = 404;
      throw err;
    }

    // Guard against durationDays being unset in older plan rows
    const durationDays = plan.durationDays || 30;

    return sequelize.transaction(async (t) => {
      // SELECT FOR UPDATE inside a transaction is the only reliable way to prevent
      // two concurrent requests from each seeing "no active sub" and both creating one
      const existing = await Subscription.findOne({
        where: { companyId: command.companyId, status: 'active' },
        lock:  t.LOCK.UPDATE,
        transaction: t,
      });
      if (existing) {
        const err = new Error('Company already has an active subscription');
        err.status = 409;
        throw err;
      }

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);

      // Create as pending — only activated after payment succeeds
      const subscription = await Subscription.create({
        companyId:        command.companyId,
        planId:           command.planId,
        status:           'pending',
        currentPeriodEnd: endDate,
        jobsPostedCount:  0,
      }, { transaction: t });

      // Simulate payment — always succeeds in this environment
      const payment = await Payment.create({
        companyId:      command.companyId,
        subscriptionId: subscription.id,
        amount:         plan.price,
        status:         'success',
        createdAt:      new Date(),
      }, { transaction: t });

      subscription.status = 'active';
      await subscription.save({ transaction: t });

      return { subscription, payment };
    });
  }
}

module.exports = new SubscribeToPlanHandler();
