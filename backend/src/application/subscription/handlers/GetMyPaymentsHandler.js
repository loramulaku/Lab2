const Payment = require('../../../models/sql/Payment');
const Plan    = require('../../../models/sql/Plan');

class GetMyPaymentsHandler {
  async handle(query) {
    if (!query.companyId) return [];

    const payments = await Payment.findAll({
      where: { companyId: query.companyId },
      include: [{ model: Plan, as: 'Plan', attributes: ['id', 'name', 'price'], required: false }],
      order: [['created_at', 'DESC']],
    });

    return payments.map(p => ({
      id:                    p.id,
      amount:                p.amount ? Number(p.amount) : null,
      currency:              p.currency ?? 'usd',
      status:                p.status,
      paymentMethod:         p.paymentMethod ?? null,
      stripePaymentIntentId: p.stripePaymentIntentId,
      planName:              p.Plan?.name ?? null,
      planPrice:             p.Plan?.price ?? null,
      createdAt:             p.createdAt,
    }));
  }
}

module.exports = new GetMyPaymentsHandler();
