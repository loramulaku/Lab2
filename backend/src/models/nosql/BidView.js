const mongoose = require('mongoose');

const BidViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    jobId: { type: Number },
    freelancerId: { type: Number },
    price: { type: Number },
    message: { type: String },
    status: { type: String },
    deliveryTimeDays: { type: Number },
    invitationId:     { type: Number },
    createdAt:        { type: Date },
    jobTitle:         { type: String },
    companyName: { type: String },
    freelancerFirstName: { type: String },
    freelancerLastName: { type: String },
  },
  { _id: false, timestamps: false, collection: 'bid_views' }
);

BidViewSchema.index({ jobId: 1 });
BidViewSchema.index({ freelancerId: 1 });
BidViewSchema.index({ status: 1 });

module.exports = mongoose.model('BidView', BidViewSchema);
