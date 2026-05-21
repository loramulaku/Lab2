const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const User = sequelize.define('User', {
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  firstName:    { type: DataTypes.STRING(100), field: 'first_name' },
  lastName:     { type: DataTypes.STRING(100), field: 'last_name' },
  email:        { type: DataTypes.STRING(150), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
  isActive:     { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
  avatarPath:   { type: DataTypes.STRING(500), allowNull: true, field: 'avatar_path' },
}, {
  tableName: 'Users',
  underscored: false,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = User;
