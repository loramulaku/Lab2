const mongoose = require('mongoose');

const ContractViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    jobId: { type: Number },
    freelancerId: { type: Number },
    companyId: { type: Number },
    bidId: { type: Number },
    agreedPrice: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String },
    price: { type: Number },
    jobTitle: { type: String },
    freelancerFirstName: { type: String },
    freelancerLastName: { type: String },
    companyName: { type: String },
  },
  { _id: false, timestamps: false, collection: 'contract_views' }
);

ContractViewSchema.index({ jobId: 1 });
ContractViewSchema.index({ freelancerId: 1 });
ContractViewSchema.index({ companyId: 1 });
ContractViewSchema.index({ status: 1 });

module.exports = mongoose.model('ContractView', ContractViewSchema);
