const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Setting = sequelize.define('Setting', {
  id:     { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, field: 'user_id' },
  key:    { type: DataTypes.STRING(100) },
  value:  { type: DataTypes.TEXT },
}, {
  tableName: 'Settings',
  timestamps: false,
});

module.exports = Setting;
