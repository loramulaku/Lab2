const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const SiteContent = sequelize.define('SiteContent', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  key:        { type: DataTypes.STRING(120), allowNull: false, unique: true },
  value:      { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  label:      { type: DataTypes.STRING(160), allowNull: true },
  updatedBy:  { type: DataTypes.INTEGER, field: 'updated_by', allowNull: true },
  createdAt:  { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW },
  updatedAt:  { type: DataTypes.DATE, field: 'updated_at', defaultValue: DataTypes.NOW },
}, {
  tableName: 'SiteContents',
  timestamps: true,
  underscored: true,
});

module.exports = SiteContent;
