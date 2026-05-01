const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const RecruiterProfile = sequelize.define('RecruiterProfile', {
  id:     { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false,unique: true, field: 'user_id' },
  companyId: { type: DataTypes.INTEGER, allowNull: false,field: 'company_id' }, 
  tableName: 'RecruiterProfiles',
  timestamps: false,
});

module.exports = RecruiterProfile;
