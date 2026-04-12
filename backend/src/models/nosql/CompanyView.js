const mongoose = require('mongoose');

/**
 * CompanyView — read-optimised projection of the Companies table.
 * _id = MySQL Companies.id.
 */
const CompanyViewSchema = new mongoose.Schema(
  {
    _id:         { type: Number },          // MySQL Companies.id
    name:        { type: String },
    description: { type: String },
    website:     { type: String },
    createdAt:   { type: Date },
  },
  { _id: false, timestamps: false, collection: 'company_views' }
);

CompanyViewSchema.index({ name: 1 });

module.exports = mongoose.model('CompanyView', CompanyViewSchema);
