const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Bid = sequelize.define('Bid', {
  id:               { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  jobId:            { type: DataTypes.INTEGER, field: 'job_id' },
  freelancerId:     { type: DataTypes.INTEGER, field: 'freelancer_id' },
  price:            { type: DataTypes.DECIMAL(10, 2) },
  message:          { type: DataTypes.TEXT },
  coverLetter:      { type: DataTypes.TEXT, field: 'cover_letter' },
  status:           { type: DataTypes.STRING(50) },
  deliveryTimeDays: { type: DataTypes.INTEGER, field: 'delivery_time_days' },
  createdAt:        { type: DataTypes.DATE, field: 'created_at' },
  updatedAt:        { type: DataTypes.DATE, field: 'updated_at' },
}, {
  tableName: 'Bids',
  timestamps: false,
});

module.exports = Bid;
