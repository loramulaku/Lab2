const mongoose = require('mongoose');

/**
 * PaymentView — read-optimised projection of the Payments table.
 * _id = MySQL Payments.id.
 * Company name is denormalised so reads never require a join.
 */
const PaymentViewSchema = new mongoose.Schema(
  {
    _id:                  { type: Number },          // MySQL Payments.id
    companyId:            { type: Number },
    stripePaymentIntentId: { type: String },
    amount:               { type: Number },
    status:               { type: String },
    createdAt:            { type: Date },
    // ── denormalised from Companies ──────────
    companyName: { type: String },
  },
  { _id: false, timestamps: false, collection: 'payment_views' }
);

PaymentViewSchema.index({ companyId: 1 });
PaymentViewSchema.index({ status: 1 });
PaymentViewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PaymentView', PaymentViewSchema);
