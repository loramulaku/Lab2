const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const AuditLog = sequelize.define('AuditLog', {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:    { type: DataTypes.INTEGER, field: 'user_id' },
  action:    { type: DataTypes.STRING(255) },
  entity:    { type: DataTypes.STRING(100) },
  oldValue:  { type: DataTypes.TEXT, field: 'old_value' },
  newValue:  { type: DataTypes.TEXT, field: 'new_value' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
}, {
  tableName: 'AuditLogs',
  timestamps: false,
});

module.exports = AuditLog;
