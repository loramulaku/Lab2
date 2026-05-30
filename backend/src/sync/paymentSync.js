const Payment        = require('../models/sql/Payment');
const Company        = require('../models/sql/Company');
const FailedSync     = require('../models/sql/FailedSync');
const paymentMongoRepo = require('../repositories/mongodb/payment.repo');

async function syncPayment(paymentId) {
  const payment = await Payment.findByPk(paymentId);
  if (!payment) {
    await paymentMongoRepo.delete(paymentId);
    return;
  }

  const company = payment.companyId ? await Company.findByPk(payment.companyId) : null;

  await paymentMongoRepo.upsert({
    id:                    payment.id,
    companyId:             payment.companyId,
    stripePaymentIntentId: payment.stripePaymentIntentId,
    amount:                payment.amount ? Number(payment.amount) : null,
    status:                payment.status,
    createdAt:             payment.createdAt,
    companyName:           company?.name ?? null,
  });

  await FailedSync.destroy({ where: { entityType: 'payment', entityId: paymentId } });
}

function syncPaymentSafe(paymentId) {
  syncPayment(paymentId).catch(async (err) => {
    console.error(`[paymentSync] Failed to sync paymentId=${paymentId}:`, err.message);
    try {
      const [record, created] = await FailedSync.findOrCreate({
        where: { entityType: 'payment', entityId: paymentId },
        defaults: {
          entityType:      'payment',
          entityId:        paymentId,
          errorMessage:    err.message,
          attempts:        1,
          lastAttemptedAt: new Date(),
          createdAt:       new Date(),
        },
      });
      if (!created) {
        await record.update({
          errorMessage:    err.message,
          attempts:        record.attempts + 1,
          lastAttemptedAt: new Date(),
          resolvedAt:      null,
        });
      }
    } catch (dbErr) {
      console.error('[paymentSync] Could not write to FailedSyncs:', dbErr.message);
    }
  });
}

module.exports = { syncPayment, syncPaymentSafe };
