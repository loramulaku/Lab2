const mongoose = require('mongoose');

const MessageViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    conversationId: { type: Number },
    senderId: { type: Number },
    message: { type: String },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date },
    senderName: { type: String },
  },
  { _id: false, timestamps: false, collection: 'message_views' }
);

MessageViewSchema.index({ conversationId: 1 });
MessageViewSchema.index({ senderId: 1 });
MessageViewSchema.index({ isRead: 1 });

module.exports = mongoose.model('MessageView', MessageViewSchema);
