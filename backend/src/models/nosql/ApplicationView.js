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
    stageName:            { type: String, default: null },
    status:               { type: String },
    appliedAt:            { type: Date },
    interviewAt:          { type: Date, default: null },
    // ── submitted application form ────────────
    coverLetter:          { type: String, default: null },
    expectedSalary:       { type: Number, default: null },
    availableFrom:        { type: String, default: null },
    cvPath:               { type: String, default: null },
    phone:                { type: String, default: null },
    willingToRelocate:    { type: Boolean, default: null },
    yearsExperience:      { type: Number, default: null },
    screeningAnswers:     { type: mongoose.Schema.Types.Mixed, default: null },
    skillsSnapshot:       { type: mongoose.Schema.Types.Mixed, default: null },
    // ── denormalised from Jobs → Companies ───
    companyId:            { type: Number },
    jobTitle:             { type: String },
    jobEmploymentType:    { type: String },
    companyName:          { type: String },
    // ── denormalised from Users ───────────────
    applicantFirstName:   { type: String },
    applicantLastName:    { type: String },
    applicantEmail:       { type: String },
    applicantAvatarPath:  { type: String, default: null },
  },
  { _id: false, timestamps: false, collection: 'application_views' }
);

ApplicationViewSchema.index({ jobId: 1 });
ApplicationViewSchema.index({ userId: 1 });
ApplicationViewSchema.index({ companyId: 1 });
ApplicationViewSchema.index({ status: 1 });

module.exports = mongoose.model('ApplicationView', ApplicationViewSchema);
