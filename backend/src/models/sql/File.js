const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const File = sequelize.define('File', {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:    { type: DataTypes.INTEGER, field: 'user_id' },
  fileUrl:   { type: DataTypes.TEXT, field: 'file_url' },
  fileType:  { type: DataTypes.STRING(50), field: 'file_type' },
  createdAt: { type: DataTypes.DATE, field: 'created_at' },
}, {
  tableName: 'Files',
  timestamps: false,
});

module.exports = File;
