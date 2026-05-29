const mongoose = require('mongoose');

const siteContentViewSchema = new mongoose.Schema(
  {
    _id:       { type: Number },
    key:       { type: String, required: true, unique: true },
    value:     { type: String, default: '' },
    label:     { type: String, default: null },
    updatedAt: { type: Date,   default: Date.now },
  },
  { _id: false, timestamps: false, collection: 'site_content_views' }
);

siteContentViewSchema.index({ key: 1 }, { unique: true });

module.exports = mongoose.model('SiteContentView', siteContentViewSchema);
