const stripe               = require('../../../config/stripe');
const Plan                 = require('../../../models/sql/Plan');
const Company              = require('../../../models/sql/Company');

class CreateCheckoutSessionHandler {
  async handle(command) {
    const plan = await Plan.findByPk(command.planId);
    if (!plan || !plan.isActive) {
      const err = new Error('Plan not found or inactive');
      err.status = 404;
      throw err;
    }

    const company = await Company.findByPk(command.companyId);
    if (!company) {
      const err = new Error('Company not found');
      err.status = 404;
      throw err;
    }

    let stripeCustomerId = company.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: command.userEmail,
        name:  company.name,
        metadata: { companyId: String(command.companyId) },
      });
      stripeCustomerId = customer.id;
      await company.update({ stripeCustomerId });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Idempotency key: same company + plan within a 5-minute window
    // returns the same Stripe session rather than creating a duplicate.
    const windowBucket  = Math.floor(Date.now() / 300_000);
    const idempotencyKey = `checkout-co${command.companyId}-pl${command.planId}-${windowBucket}`;

    const session = await stripe.checkout.sessions.create(
      {
        customer:             stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [{ price: plan.stripePriceId, quantity: 1 }],
        mode:        'subscription',
        success_url: `${frontendUrl}/recruiter/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:  `${frontendUrl}/recruiter/payment/cancelled`,
        metadata: {
          companyId: String(command.companyId),
          planId:    String(command.planId),
          userId:    String(command.userId ?? ''),
        },
      },
      { idempotencyKey },
    );

    return { url: session.url };
  }
}

module.exports = new CreateCheckoutSessionHandler();
