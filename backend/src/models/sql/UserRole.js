const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const UserRole = sequelize.define('UserRole', {
  id:     { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  roleId: { type: DataTypes.INTEGER, allowNull: false, field: 'role_id' },
}, {
  tableName: 'UserRoles',
  timestamps: false,
  indexes: [{ unique: true, fields: ['user_id', 'role_id'] }],
});

module.exports = UserRole;
