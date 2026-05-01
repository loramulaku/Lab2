const Subscription     = require('../models/sql/Subscription');
const Plan             = require('../models/sql/Plan');
const RecruiterProfile = require('../models/sql/RecruiterProfile');

module.exports = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const recruiter = await RecruiterProfile.findOne({ where: { userId } });
    if (!recruiter) {
      return res.status(403).json({ message: 'User is not a recruiter' });
    }

    const companyId = recruiter.companyId;

    const subscription = await Subscription.findOne({ where: { companyId } });
    if (!subscription) {
      return res.status(403).json({ message: 'No active subscription' });
    }

    // Status check
    if (subscription.status && subscription.status !== 'active') {
      return res.status(403).json({ message: 'Subscription is not active' });
    }

    // Expiration check — auto-mark as expired if past currentPeriodEnd
    if (subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date()) {
      subscription.status = 'expired';
      await subscription.save();
      return res.status(403).json({ message: 'Subscription expired' });
    }

    const plan = await Plan.findByPk(subscription.planId);
    if (!plan) {
      return res.status(500).json({ message: 'Plan not found' });
    }

    if (subscription.jobsPostedCount >= plan.jobLimit) {
      return res.status(403).json({ message: 'Job posting limit reached' });
    }

    req.subscription = subscription;
    req.companyId    = companyId;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
