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
  // ── richer offer (fixed/hourly, availability, milestones, portfolio) ──
  bidType:          { type: DataTypes.ENUM('fixed', 'hourly'), defaultValue: 'fixed', field: 'bid_type' },
  hoursPerWeek:     { type: DataTypes.INTEGER, field: 'hours_per_week' },
  startDate:        { type: DataTypes.DATEONLY, field: 'start_date' },
  milestones:       { type: DataTypes.JSON, field: 'milestones' },
  portfolioLinks:   { type: DataTypes.JSON, field: 'portfolio_links' },
  skillsSnapshot:   { type: DataTypes.JSON, field: 'skills_snapshot' },
  createdAt:        { type: DataTypes.DATE, field: 'created_at' },
  updatedAt:        { type: DataTypes.DATE, field: 'updated_at' },
}, {
  tableName: 'Bids',
  timestamps: false,
  indexes: [{ unique: true, fields: ['freelancer_id', 'job_id'], name: 'bids_freelancer_job_unique' }],
});

module.exports = Bid;
