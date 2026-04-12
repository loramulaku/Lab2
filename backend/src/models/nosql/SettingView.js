const mongoose = require('mongoose');

const settingViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    userId: { type: Number },
    key: { type: String },
    value: { type: String },
  },
  { _id: false, timestamps: false, collection: 'setting_views' }
);

settingViewSchema.index({ userId: 1 });

module.exports = mongoose.model('SettingView', settingViewSchema);
