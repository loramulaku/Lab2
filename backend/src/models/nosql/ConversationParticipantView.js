const mongoose = require('mongoose');

const ConversationParticipantViewSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    conversationId: { type: Number },
    userId: { type: Number },
    firstName: { type: String },
    lastName: { type: String },
  },
  { _id: false, timestamps: false, collection: 'conversation_participant_views' }
);

ConversationParticipantViewSchema.index({ conversationId: 1 });
ConversationParticipantViewSchema.index({ userId: 1 });

module.exports = mongoose.model('ConversationParticipantView', ConversationParticipantViewSchema);
