const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Review = sequelize.define('Review', {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  reviewerId: { type: DataTypes.INTEGER, field: 'reviewer_id' },
  reviewedId: { type: DataTypes.INTEGER, field: 'reviewed_id' },
  rating:     { type: DataTypes.INTEGER },
  comment:    { type: DataTypes.TEXT },
}, {
  tableName: 'Reviews',
  timestamps: false,
});

module.exports = Review;
