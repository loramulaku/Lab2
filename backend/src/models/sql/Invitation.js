const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Invitation = sequelize.define('Invitation', {
  id:               { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  companyId:        { type: DataTypes.INTEGER, field: 'company_id' },
  freelancerId:     { type: DataTypes.INTEGER, field: 'freelancer_id' },
  jobId:            { type: DataTypes.INTEGER, allowNull: true, field: 'job_id' },
  message:          { type: DataTypes.TEXT },
  priceOffer:       { type: DataTypes.DECIMAL(10, 2), field: 'price_offer' },
  deliveryTimeDays: { type: DataTypes.INTEGER, field: 'delivery_time_days' },
  status:           { type: DataTypes.STRING(50) },
  createdAt:        { type: DataTypes.DATE, field: 'created_at' },
}, {
  tableName: 'Invitations',
  timestamps: false,
});

module.exports = Invitation;
