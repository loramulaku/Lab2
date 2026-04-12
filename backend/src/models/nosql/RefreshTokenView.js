const mongoose = require('mongoose');

const refreshTokenViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    userId: { type: Number },
    token: { type: String },
    expiresAt: { type: Date },
  },
  { _id: false, timestamps: false, collection: 'refresh_token_views' }
);

refreshTokenViewSchema.index({ userId: 1 });

module.exports = mongoose.model('RefreshTokenView', refreshTokenViewSchema);
