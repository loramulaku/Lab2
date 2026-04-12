const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Company = sequelize.define('Company', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.TEXT },
  website:     { type: DataTypes.STRING(255) },
  createdAt:   { type: DataTypes.DATE, field: 'created_at' },
}, {
  tableName: 'Companies',
  timestamps: false,
});

module.exports = Company;
