const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const CandidateProfile = sequelize.define('CandidateProfile', {
  id:       { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:   { type: DataTypes.INTEGER, unique: true, field: 'user_id' },
  headline: { type: DataTypes.STRING(255) },
  bio:      { type: DataTypes.TEXT },
  location: { type: DataTypes.STRING(150) },
}, {
  tableName: 'CandidateProfiles',
  timestamps: false,
});

module.exports = CandidateProfile;
