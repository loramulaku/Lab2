const mongoose = require('mongoose');

const notificationViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    userId: { type: Number },
    type: { type: String },
    title: { type: String, default: null },
    message: { type: String },
    link:    { type: String, default: null },
    isRead:  { type: Boolean, default: false },
    createdAt: { type: Date },
  },
  { _id: false, timestamps: false, collection: 'notification_views' }
);

notificationViewSchema.index({ userId: 1 });
notificationViewSchema.index({ isRead: 1 });

module.exports = mongoose.model('NotificationView', notificationViewSchema);
