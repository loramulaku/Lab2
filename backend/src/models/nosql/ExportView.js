const mongoose = require('mongoose');

const ExportViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    userId: { type: Number },
    reportId: { type: Number },
    type: { type: String },
    filePath: { type: String },
    createdAt: { type: Date },
    userName: { type: String },
    reportName: { type: String },
  },
  { _id: false, timestamps: false, collection: 'export_views' }
);

ExportViewSchema.index({ userId: 1 });
ExportViewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ExportView', ExportViewSchema);
