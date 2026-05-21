const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Experience = sequelize.define('Experience', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:      { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  title:       { type: DataTypes.STRING(255), allowNull: false },
  company:     { type: DataTypes.STRING(255), allowNull: false },
  startDate:   { type: DataTypes.DATEONLY, allowNull: false, field: 'start_date' },
  endDate:     { type: DataTypes.DATEONLY, allowNull: true, field: 'end_date' },
  description: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'Experiences',
  timestamps: false,
});

module.exports = Experience;
