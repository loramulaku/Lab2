const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Category = sequelize.define('Category', {
  id:   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100) },
}, {
  tableName: 'Categories',
  timestamps: false,
});

module.exports = Category;
