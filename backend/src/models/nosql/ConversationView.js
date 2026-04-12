const mongoose = require('mongoose');

const ConversationViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    createdAt: { type: Date },
    participants: [
      {
        userId: { type: Number },
        firstName: { type: String },
        lastName: { type: String },
      },
    ],
    lastMessage: {
      senderId: { type: Number },
      senderName: { type: String },
      message: { type: String },
      sentAt: { type: Date },
    },
  },
  { _id: false, timestamps: false, collection: 'conversation_views' }
);

module.exports = mongoose.model('ConversationView', ConversationViewSchema);
