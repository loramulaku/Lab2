const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const RolePermission = sequelize.define('RolePermission', {
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  roleId:       { type: DataTypes.INTEGER, allowNull: false, field: 'role_id' },
  permissionId: { type: DataTypes.INTEGER, allowNull: false, field: 'permission_id' },
}, {
  tableName: 'RolePermissions',
  timestamps: false,
  indexes: [{ unique: true, fields: ['role_id', 'permission_id'] }],
});

module.exports = RolePermission;
