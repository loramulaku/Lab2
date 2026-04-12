const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Conversation = sequelize.define('Conversation', {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
}, {
  tableName: 'Conversations',
  timestamps: false,
});

module.exports = Conversation;
