const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const RefreshToken = sequelize.define('RefreshToken', {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:    { type: DataTypes.INTEGER, field: 'user_id' },
  token:     { type: DataTypes.TEXT },
  expiresAt: { type: DataTypes.DATE, field: 'expires_at' },
}, {
  tableName: 'RefreshTokens',
  timestamps: false,
});

module.exports = RefreshToken;
