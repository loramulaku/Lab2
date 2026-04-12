const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Report = sequelize.define('Report', {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:      { type: DataTypes.STRING(100) },
  filters:   { type: DataTypes.TEXT },
  createdBy: { type: DataTypes.INTEGER, field: 'created_by' },
}, {
  tableName: 'Reports',
  timestamps: false,
});

module.exports = Report;
