const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const PipelineNote = sequelize.define('PipelineNote', {
  id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  applicationId: { type: DataTypes.INTEGER, field: 'application_id', allowNull: false },
  stageId:       { type: DataTypes.INTEGER, field: 'stage_id',       allowNull: false },
  note:          { type: DataTypes.TEXT,    allowNull: false },
  createdBy:     { type: DataTypes.INTEGER, field: 'created_by',     allowNull: false },
  createdAt:     { type: DataTypes.DATE,    field: 'created_at' },
}, {
  tableName:  'PipelineNotes',
  timestamps: false,
});

module.exports = PipelineNote;
