const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Payment = sequelize.define('Payment', {
  id:                   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  companyId:            { type: DataTypes.INTEGER, field: 'company_id' },
  stripePaymentIntentId:{ type: DataTypes.STRING(255), field: 'stripe_payment_intent_id' },
  amount:               { type: DataTypes.DECIMAL(10, 2) },
  status:               { type: DataTypes.STRING(50) },
  createdAt:            { type: DataTypes.DATE, field: 'created_at' },
}, {
  tableName: 'Payments',
  timestamps: false,
});

module.exports = Payment;
