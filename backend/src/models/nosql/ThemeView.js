const mongoose = require('mongoose');

const themeViewSchema = new mongoose.Schema({
  _id: Number,
  isActive: { type: Boolean, default: false },
  config: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: Date,
  updatedAt: Date,
}, {
  collection: 'theme_views',
  timestamps: false,
});

module.exports = mongoose.model('ThemeView', themeViewSchema);
