const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Role = sequelize.define('Role', {
  id:   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(50), unique: true },
}, {
  tableName: 'Roles',
  timestamps: false,
});

module.exports = Role;
