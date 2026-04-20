const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Job = sequelize.define('Job', {
  id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  companyId:      { type: DataTypes.INTEGER, field: 'company_id' },
  title:          { type: DataTypes.STRING(255) },
  description:    { type: DataTypes.TEXT },
  employmentType: { type: DataTypes.STRING(50), field: 'employment_type' },
  workMode:       { type: DataTypes.STRING(50), field: 'work_mode' },
  jobMode:        { type: DataTypes.STRING(50), field: 'job_mode' },
  budgetMin:      { type: DataTypes.DECIMAL(10, 2), field: 'budget_min' },
  budgetMax:      { type: DataTypes.DECIMAL(10, 2), field: 'budget_max' },
  recruiterId:     { type: DataTypes.INTEGER, field: 'recruiter_id' },
  experienceLevel: { type: DataTypes.ENUM('junior', 'mid', 'senior'), field: 'experience_level' },
  expiresAt:       { type: DataTypes.DATE, field: 'expires_at' },
  deadline:        { type: DataTypes.DATE },
  status:          { type: DataTypes.STRING(50), defaultValue: 'open' },
  createdAt:      { type: DataTypes.DATE, field: 'created_at' },
}, {
  tableName: 'Jobs',
  timestamps: false,
});

module.exports = Job;
