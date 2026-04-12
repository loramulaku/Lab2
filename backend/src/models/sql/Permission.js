const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Permission = sequelize.define('Permission', {
  id:   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), unique: true },
}, {
  tableName: 'Permissions',
  timestamps: false,
});

module.exports = Permission;
