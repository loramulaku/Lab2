const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Pipeline = sequelize.define('Pipeline', {
  id:    { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  jobId: { type: DataTypes.INTEGER, field: 'job_id' },
  name:  { type: DataTypes.STRING(100) },
}, {
  tableName: 'Pipelines',
  timestamps: false,
});

module.exports = Pipeline;
