const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Theme = sequelize.define('Theme', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_active',
  },
  config: {
    type: DataTypes.JSON,
    allowNull: false,
  },
}, {
  tableName: 'themes',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Theme;

