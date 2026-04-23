const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const FailedSync = sequelize.define('FailedSync', {
  id:              { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  entityType:      { type: DataTypes.STRING(20), allowNull: false, field: 'entity_type' },
  entityId:        { type: DataTypes.INTEGER,    allowNull: false, field: 'entity_id' },
  errorMessage:    { type: DataTypes.TEXT,       allowNull: true,  field: 'error_message' },
  attempts:        { type: DataTypes.INTEGER,    allowNull: false, defaultValue: 1 },
  lastAttemptedAt: { type: DataTypes.DATE,       allowNull: false, field: 'last_attempted_at' },
  resolvedAt:      { type: DataTypes.DATE,       allowNull: true,  defaultValue: null, field: 'resolved_at' },
}, {
  tableName:  'FailedSyncs',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  false,
});

module.exports = FailedSync;
