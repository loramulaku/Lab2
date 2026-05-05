const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Application = sequelize.define('Application', {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  jobId:     { type: DataTypes.INTEGER, field: 'job_id' },
  userId:    { type: DataTypes.INTEGER, field: 'user_id' },
  stageId:      { type: DataTypes.INTEGER, field: 'stage_id' },
  currentStage: { type: DataTypes.STRING(50), field: 'current_stage', defaultValue: 'applied' },
  status:       { type: DataTypes.STRING(50), defaultValue: 'active' },
  coverLetter:  { type: DataTypes.TEXT, field: 'cover_letter' },
  appliedAt:    { type: DataTypes.DATE, field: 'applied_at' },
}, {
  tableName: 'Applications',
  timestamps: false,
});

module.exports = Application;
