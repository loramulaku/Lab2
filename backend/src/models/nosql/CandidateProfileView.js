const mongoose = require('mongoose');

/**
 * CandidateProfileView — read-optimised projection of the CandidateProfiles table.
 * _id = MySQL CandidateProfiles.id.
 * User fields (firstName, lastName, email) and skills are denormalised
 * so reads never require a join.
 */
const CandidateProfileViewSchema = new mongoose.Schema(
  {
    _id:       { type: Number },          // MySQL CandidateProfiles.id
    userId:    { type: Number },
    headline:  { type: String },
    bio:       { type: String },
    location:  { type: String },
    // ── denormalised from Users ───────────────
    firstName: { type: String },
    lastName:  { type: String },
    email:     { type: String },
    // ── denormalised from CandidateSkills + Skills ───
    skills: [
      {
        _id:   false,
        name:  { type: String },
        level: { type: String },
      },
    ],
  },
  { _id: false, timestamps: false, collection: 'candidate_profile_views' }
);

CandidateProfileViewSchema.index({ userId: 1 });
CandidateProfileViewSchema.index({ location: 1 });

module.exports = mongoose.model('CandidateProfileView', CandidateProfileViewSchema);
