const mongoose = require('mongoose');

const InvitationViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    companyId: { type: Number },
    freelancerId: { type: Number },
    jobId: { type: Number },
    message: { type: String },
    priceOffer: { type: Number },
    deliveryTimeDays: { type: Number },
    status: { type: String },
    createdAt: { type: Date },
    companyName: { type: String },
    freelancerFirstName: { type: String },
    freelancerLastName: { type: String },
    jobTitle: { type: String },
  },
  { _id: false, timestamps: false, collection: 'invitation_views' }
);

InvitationViewSchema.index({ companyId: 1 });
InvitationViewSchema.index({ freelancerId: 1 });
InvitationViewSchema.index({ status: 1 });

module.exports = mongoose.model('InvitationView', InvitationViewSchema);
