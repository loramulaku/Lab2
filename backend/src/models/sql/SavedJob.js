'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const SavedJob = sequelize.define('SavedJob', {
  id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  jobId:  { type: DataTypes.INTEGER, allowNull: false, field: 'job_id' },
}, {
  tableName: 'saved_jobs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [{ unique: true, fields: ['user_id', 'job_id'] }],
});

module.exports = SavedJob;
