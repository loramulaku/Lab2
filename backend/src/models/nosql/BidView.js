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
    bidType: { type: String, default: 'fixed' },
    hoursPerWeek: { type: Number, default: null },
    startDate: { type: String, default: null },
    milestones: { type: mongoose.Schema.Types.Mixed, default: null },
    portfolioLinks: { type: mongoose.Schema.Types.Mixed, default: null },
    skillsSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    companyId: { type: Number, default: null },
    jobTitle: { type: String },
    companyName: { type: String },
    freelancerFirstName: { type: String },
    freelancerLastName: { type: String },
  },
  { _id: false, timestamps: false, collection: 'bid_views' }
);

BidViewSchema.index({ jobId: 1 });
BidViewSchema.index({ freelancerId: 1 });
BidViewSchema.index({ companyId: 1 });
BidViewSchema.index({ status: 1 });

module.exports = mongoose.model('BidView', BidViewSchema);
