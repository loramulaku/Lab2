const mongoose = require('mongoose');

/**
 * JobView — read-optimised projection of the Jobs table.
 * _id = MySQL Jobs.id. Company, skill names, and category names are
 * denormalised so reads never require a join.
 */
const JobViewSchema = new mongoose.Schema(
  {
    _id:            { type: Number },          // MySQL Jobs.id
    title:          { type: String },
    description:    { type: String },
    employmentType: { type: String },
    workMode:       { type: String },
    jobMode:        { type: String },
    budgetMin:      { type: Number },
    budgetMax:      { type: Number },
    recruiterId:     { type: Number },
    experienceLevel: { type: String, enum: ['junior', 'mid', 'senior'] },
    status:          { type: String },
    expiresAt:       { type: Date },
    deadline:       { type: Date },
    createdAt:      { type: Date },
    // ── denormalised ─────────────────────────
    company: {
      id:      { type: Number },
      name:    { type: String },
      website: { type: String },
    },
    skills:           [String],
    categories:       [String],
    applicationCount: { type: Number, default: 0 },
    bidCount:         { type: Number, default: 0 },
  },
  { _id: false, timestamps: false, collection: 'job_views' }
);

JobViewSchema.index({ status: 1 });
JobViewSchema.index({ 'company.id': 1 });
JobViewSchema.index({ skills: 1 });
JobViewSchema.index({ categories: 1 });

module.exports = mongoose.model('JobView', JobViewSchema);
