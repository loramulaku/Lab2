const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const RecruiterProfile = sequelize.define('RecruiterProfile', {
  id:          { type: DataTypes.INTEGER,    autoIncrement: true, primaryKey: true },
  userId:      { type: DataTypes.INTEGER,    unique: true, field: 'user_id' },
  companyId:   { type: DataTypes.INTEGER,    field: 'company_id' },
  jobTitle:    { type: DataTypes.STRING(150), field: 'job_title' },
  phone:       { type: DataTypes.STRING(50) },
  linkedinUrl: { type: DataTypes.STRING(500), field: 'linkedin_url' },
}, {
  tableName: 'RecruiterProfiles',
  timestamps: false,
});

module.exports = RecruiterProfile;
