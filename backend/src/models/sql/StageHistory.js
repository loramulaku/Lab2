const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const StageHistory = sequelize.define('StageHistory', {
  id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  applicationId: { type: DataTypes.INTEGER, field: 'application_id' },
  fromStageId:   { type: DataTypes.INTEGER, field: 'from_stage_id' },
  toStageId:     { type: DataTypes.INTEGER, field: 'to_stage_id' },
  changedBy:     { type: DataTypes.INTEGER, field: 'changed_by' },
  createdAt:     { type: DataTypes.DATE, field: 'created_at' },
}, {
  tableName: 'StageHistory',
  timestamps: false,
});

module.exports = StageHistory;
