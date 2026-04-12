const mongoose = require('mongoose');

/**
 * RecruiterProfileView — read-optimised projection of the RecruiterProfiles table.
 * _id = MySQL RecruiterProfiles.id.
 * User fields and company fields are denormalised so reads never require a join.
 */
const RecruiterProfileViewSchema = new mongoose.Schema(
  {
    _id:            { type: Number },          // MySQL RecruiterProfiles.id
    userId:         { type: Number },
    companyId:      { type: Number },
    // ── denormalised from Users ───────────────
    firstName:      { type: String },
    lastName:       { type: String },
    email:          { type: String },
    // ── denormalised from Companies ──────────
    companyName:    { type: String },
    companyWebsite: { type: String },
  },
  { _id: false, timestamps: false, collection: 'recruiter_profile_views' }
);

RecruiterProfileViewSchema.index({ userId: 1 });
RecruiterProfileViewSchema.index({ companyId: 1 });

module.exports = mongoose.model('RecruiterProfileView', RecruiterProfileViewSchema);
