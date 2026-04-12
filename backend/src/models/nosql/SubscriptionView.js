const mongoose = require('mongoose');

/**
 * SubscriptionView — read-optimised projection of the Subscriptions table.
 * _id = MySQL Subscriptions.id.
 * Company and plan fields are denormalised so reads never require a join.
 */
const SubscriptionViewSchema = new mongoose.Schema(
  {
    _id:                  { type: Number },          // MySQL Subscriptions.id
    companyId:            { type: Number },
    planId:               { type: Number },
    stripeSubscriptionId: { type: String },
    status:               { type: String },
    currentPeriodEnd:     { type: Date },
    // ── denormalised from Companies + Plans ──
    companyName: { type: String },
    planName:    { type: String },
    planPrice:   { type: Number },
  },
  { _id: false, timestamps: false, collection: 'subscription_views' }
);

SubscriptionViewSchema.index({ companyId: 1 });
SubscriptionViewSchema.index({ status: 1 });

module.exports = mongoose.model('SubscriptionView', SubscriptionViewSchema);
