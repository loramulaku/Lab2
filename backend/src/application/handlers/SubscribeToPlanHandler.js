const { sequelize } = require('../../config/mysql');
const planRepo      = require('../../repositories/mysql/plan.repo');
const Subscription  = require('../../models/sql/Subscription');
const Payment       = require('../../models/sql/Payment');
const RecruiterProfile = require('../../models/sql/RecruiterProfile');
const User          = require('../../models/sql/User');
const { syncSubscription } = require('../../sync/subscriptionSync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

      // Get recruiter user for email
      const recruiterProfile = await RecruiterProfile.findOne({ where: { userId: command.userId } });
      if (!recruiterProfile) {
        const err = new Error('Recruiter profile not found');
        err.status = 404;
        throw err;
      }
      const user = await User.findByPk(command.userId);
      if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
      }

      // Create Stripe customer
      let customer;
      try {
        customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        });
      } catch (stripeErr) {
        const err = new Error('Failed to create Stripe customer');
        err.status = 500;
        throw err;
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(plan.price * 100), // cents
        currency: 'usd',
        customer: customer.id,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        metadata: {
          companyId: command.companyId.toString(),
          planId: command.planId.toString(),
        },
      });

      // Create as pending — only activated after payment succeeds
      const subscription = await Subscription.create({
        companyId:           command.companyId,
        planId:              command.planId,
        stripeSubscriptionId: null, // For payment intent, not subscription
        status:              'pending',
        currentPeriodEnd:    endDate,
        jobsPostedCount:     0,
      }, { transaction: t });

      // Create payment record
      const payment = await Payment.create({
        companyId:             command.companyId,
        subscriptionId:        subscription.id,
        stripePaymentIntentId: paymentIntent.id,
        amount:                plan.price,
        status:                'pending',
        createdAt:             new Date(),
      }, { transaction: t });

      // For demo, confirm the payment immediately (in real app, handle webhook)
      await stripe.paymentIntents.confirm(paymentIntent.id, {
        payment_method: 'pm_card_visa', // Test payment method
      });

      subscription.status = 'active';
      payment.status = 'success';
      await subscription.save({ transaction: t });
      await payment.save({ transaction: t });

      return { subscription, payment };
    });

    // Fire-and-forget sync to MongoDB read store
    syncSubscription(subscription.id);
  }
}

module.exports = new SubscribeToPlanHandler();
