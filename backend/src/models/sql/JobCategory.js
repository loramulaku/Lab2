const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const JobCategory = sequelize.define('JobCategory', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  jobId:      { type: DataTypes.INTEGER, field: 'job_id' },
  categoryId: { type: DataTypes.INTEGER, field: 'category_id' },
}, {
  tableName: 'JobCategories',
  timestamps: false,
  indexes: [{ unique: true, fields: ['job_id', 'category_id'] }],
});

module.exports = JobCategory;
