const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Contract = sequelize.define('Contract', {
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  jobId:        { type: DataTypes.INTEGER, field: 'job_id' },
  freelancerId: { type: DataTypes.INTEGER, field: 'freelancer_id' },
  companyId:    { type: DataTypes.INTEGER, field: 'company_id' },
  bidId:        { type: DataTypes.INTEGER, allowNull: true, field: 'bid_id' },
  agreedPrice:  { type: DataTypes.DECIMAL(10, 2), field: 'agreed_price' },
  startDate:    { type: DataTypes.DATEONLY, field: 'start_date' },
  endDate:      { type: DataTypes.DATEONLY, field: 'end_date' },
  status:       { type: DataTypes.STRING(50) },
  price:        { type: DataTypes.DECIMAL(10, 2) },
}, {
  tableName: 'Contracts',
  timestamps: false,
});

module.exports = Contract;
