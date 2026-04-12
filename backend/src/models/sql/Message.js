const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Message = sequelize.define('Message', {
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  conversationId: { type: DataTypes.INTEGER, field: 'conversation_id' },
  senderId:       { type: DataTypes.INTEGER, field: 'sender_id' },
  message:        { type: DataTypes.TEXT },
  isRead:         { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_read' },
  createdAt:      { type: DataTypes.DATE, field: 'created_at' },
}, {
  tableName: 'Messages',
  timestamps: false,
});

module.exports = Message;
