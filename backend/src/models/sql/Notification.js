const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Notification = sequelize.define('Notification', {
  id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:        { type: DataTypes.INTEGER, field: 'user_id' },
  applicationId: { type: DataTypes.INTEGER, field: 'application_id', allowNull: true, defaultValue: null },
  type:          { type: DataTypes.STRING(100) },
  message:       { type: DataTypes.TEXT },
  link:          { type: DataTypes.STRING(500), allowNull: true, defaultValue: null },
  isRead:        { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_read' },
  createdAt:     { type: DataTypes.DATE, field: 'created_at' },
}, {
  tableName: 'Notifications',
  timestamps: false,
});

module.exports = Notification;
