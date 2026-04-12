const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const PipelineStage = sequelize.define('PipelineStage', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  pipelineId: { type: DataTypes.INTEGER, field: 'pipeline_id' },
  name:       { type: DataTypes.STRING(100) },
  orderIndex: { type: DataTypes.INTEGER, field: 'order_index' },
}, {
  tableName: 'PipelineStages',
  timestamps: false,
});

module.exports = PipelineStage;
