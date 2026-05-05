const mongoose = require('mongoose');

/**
 * ApplicationView — read-optimised projection of the Applications table.
 * _id = MySQL Applications.id. Job title, company name, and applicant
 * details are denormalised so reads never require a join.
 */
const ApplicationViewSchema = new mongoose.Schema(
  {
    _id:                  { type: Number },          // MySQL Applications.id
    jobId:                { type: Number },
    userId:               { type: Number },
    stageId:              { type: Number },
    currentStage:         { type: String },
    status:               { type: String },
    coverLetter:          { type: String },
    appliedAt:            { type: Date },
    // ── denormalised from Jobs → Companies ───
    jobTitle:             { type: String },
    companyName:          { type: String },
    // ── denormalised from Users ───────────────
    applicantFirstName:   { type: String },
    applicantLastName:    { type: String },
    applicantEmail:       { type: String },
  },
  { _id: false, timestamps: false, collection: 'application_views' }
);

ApplicationViewSchema.index({ jobId: 1 });
ApplicationViewSchema.index({ userId: 1 });
ApplicationViewSchema.index({ status: 1 });

module.exports = mongoose.model('ApplicationView', ApplicationViewSchema);
