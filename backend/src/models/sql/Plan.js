const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Plan = sequelize.define('Plan', {
  id:       { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:     { type: DataTypes.STRING(50), unique: true },
  price:    { type: DataTypes.DECIMAL(10, 2) },
  jobLimit: { type: DataTypes.INTEGER, field: 'job_limit' },
}, {
  tableName: 'Plans',
  timestamps: false,
});

module.exports = Plan;
