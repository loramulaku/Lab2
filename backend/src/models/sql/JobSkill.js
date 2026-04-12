const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const JobSkill = sequelize.define('JobSkill', {
  id:      { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  jobId:   { type: DataTypes.INTEGER, field: 'job_id' },
  skillId: { type: DataTypes.INTEGER, field: 'skill_id' },
}, {
  tableName: 'JobSkills',
  timestamps: false,
  indexes: [{ unique: true, fields: ['job_id', 'skill_id'] }],
});

module.exports = JobSkill;
