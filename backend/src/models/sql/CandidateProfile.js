const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const CandidateProfile = sequelize.define('CandidateProfile', {
  id:       { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:   { type: DataTypes.INTEGER, unique: true, field: 'user_id' },
  headline: { type: DataTypes.STRING(255) },
  bio:      { type: DataTypes.TEXT },
  location: { type: DataTypes.STRING(150) },
  freelanceActive: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'freelance_active' },
  // ── reusable fields used to prefill the application/bid forms ──
  phone:             { type: DataTypes.STRING(50),  field: 'phone' },
  linkedinUrl:       { type: DataTypes.STRING(255), field: 'linkedin_url' },
  githubUrl:         { type: DataTypes.STRING(255), field: 'github_url' },
  portfolioUrl:      { type: DataTypes.STRING(255), field: 'portfolio_url' },
  cvPath:            { type: DataTypes.STRING(500), field: 'cv_path' },
  willingToRelocate: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'willing_to_relocate' },
  yearsExperience:   { type: DataTypes.INTEGER, field: 'years_experience' },
}, {
  tableName: 'CandidateProfiles',
  timestamps: false,
});

module.exports = CandidateProfile;
