const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Export = sequelize.define('Export', {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:    { type: DataTypes.INTEGER, field: 'user_id' },
  reportId:  { type: DataTypes.INTEGER, field: 'report_id' },
  type:      { type: DataTypes.STRING(50) },
  filePath:  { type: DataTypes.TEXT, field: 'file_path' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
}, {
  tableName: 'Exports',
  timestamps: false,
});

module.exports = Export;
