const mongoose = require('mongoose');

const ReportViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    name: { type: String },
    filters: { type: String },
    createdBy: { type: Number },
    createdByName: { type: String },
  },
  { _id: false, timestamps: false, collection: 'report_views' }
);

ReportViewSchema.index({ createdBy: 1 });

module.exports = mongoose.model('ReportView', ReportViewSchema);
