const mongoose = require('mongoose');

const notificationViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    userId: { type: Number },
    type: { type: String },
    message: { type: String },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date },
  },
  { _id: false, timestamps: false, collection: 'notification_views' }
);

notificationViewSchema.index({ userId: 1 });
notificationViewSchema.index({ isRead: 1 });

module.exports = mongoose.model('NotificationView', notificationViewSchema);
