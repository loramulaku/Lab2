const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Bid = sequelize.define('Bid', {
  id:               { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  jobId:            { type: DataTypes.INTEGER, field: 'job_id' },
  freelancerId:     { type: DataTypes.INTEGER, field: 'freelancer_id' },
  price:            { type: DataTypes.DECIMAL(10, 2) },
  message:          { type: DataTypes.TEXT },
  status:           { type: DataTypes.STRING(50) },
  deliveryTimeDays: { type: DataTypes.INTEGER, field: 'delivery_time_days' },
}, {
  tableName: 'Bids',
  timestamps: false,
});

module.exports = Bid;
