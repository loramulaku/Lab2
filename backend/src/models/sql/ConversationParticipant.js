const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const ConversationParticipant = sequelize.define('ConversationParticipant', {
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  conversationId: { type: DataTypes.INTEGER, field: 'conversation_id' },
  userId:         { type: DataTypes.INTEGER, field: 'user_id' },
}, {
  tableName: 'ConversationParticipants',
  timestamps: false,
  indexes: [{ unique: true, fields: ['conversation_id', 'user_id'] }],
});

module.exports = ConversationParticipant;
