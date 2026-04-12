const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Subscription = sequelize.define('Subscription', {
  id:                   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  companyId:            { type: DataTypes.INTEGER, field: 'company_id' },
  planId:               { type: DataTypes.INTEGER, field: 'plan_id' },
  stripeSubscriptionId: { type: DataTypes.STRING(255), field: 'stripe_subscription_id' },
  status:               { type: DataTypes.STRING(50) },
  currentPeriodEnd:     { type: DataTypes.DATE, field: 'current_period_end' },
}, {
  tableName: 'Subscriptions',
  timestamps: false,
});

module.exports = Subscription;
