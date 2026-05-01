const RecruiterProfile       = require('../models/sql/RecruiterProfile');
const Subscription           = require('../models/sql/Subscription');
const Plan                   = require('../models/sql/Plan');
const SubscribeToPlanCommand = require('../application/commands/SubscribeToPlan.command');
const subscribeToPlanHandler = require('../application/handlers/SubscribeToPlanHandler');

const subscriptionController = {
  async subscribe(req, res) {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ message: 'planId is required' });
    }

    // Resolve companyId from recruiter profile — never trust request body
    const recruiter = await RecruiterProfile.findOne({ where: { userId: req.user.id } });
    if (!recruiter) {
      return res.status(403).json({ message: 'User is not a recruiter' });
    }

    const command = new SubscribeToPlanCommand({
      companyId: recruiter.companyId,
      planId:    Number(planId),
    });

    const { subscription, payment } = await subscribeToPlanHandler.handle(command);

    return res.status(201).json({
      subscription: {
        id:               subscription.id,
        companyId:        subscription.companyId,
        planId:           subscription.planId,
        status:           subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        jobsPostedCount:  subscription.jobsPostedCount,
      },
      payment: {
        id:     payment.id,
        amount: payment.amount,
        status: payment.status,
      },
    });
  },

  async getStatus(req, res) {
    const recruiter = await RecruiterProfile.findOne({ where: { userId: req.user.id } });
    if (!recruiter) {
      return res.status(403).json({ message: 'User is not a recruiter' });
    }

    // Prefer the active subscription; fall back to the most recently created one
    const subscription =
      (await Subscription.findOne({
        where: { companyId: recruiter.companyId, status: 'active' },
      })) ??
      (await Subscription.findOne({
        where: { companyId: recruiter.companyId },
        order: [['id', 'DESC']],
      }));

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    const plan = subscription.planId ? await Plan.findByPk(subscription.planId) : null;

    const jobsUsed      = subscription.jobsPostedCount ?? 0;
    const jobLimit      = plan?.jobLimit ?? null;
    const jobsRemaining = jobLimit !== null ? Math.max(0, jobLimit - jobsUsed) : null;

    return res.json({
      id:               subscription.id,
      status:           subscription.status,
      expiresAt:        subscription.currentPeriodEnd,
      planName:         plan?.name ?? null,
      jobLimit,
      jobsUsed,
      jobsRemaining,
    });
  },
};

module.exports = subscriptionController;
