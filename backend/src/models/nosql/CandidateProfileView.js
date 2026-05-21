const mongoose = require('mongoose');

/**
 * CandidateProfileView — denormalised read projection for candidate profiles.
 * _id = MySQL Users.id (userId) for O(1) lookups by user.
 * All related data (skills, experiences, educations, stats) is embedded so
 * reads require no joins.
 */
const CandidateProfileViewSchema = new mongoose.Schema(
  {
    _id:        { type: Number },               // MySQL Users.id
    firstName:  { type: String },
    lastName:   { type: String },
    email:      { type: String },
    avatarPath: { type: String, default: null },
    // ── profile fields ───────────────────────
    headline:   { type: String, default: null },
    bio:        { type: String, default: null },
    location:   { type: String, default: null },
    // ── denormalised skills ──────────────────
    skills: [
      {
        _id:     false,
        skillId: { type: Number },
        name:    { type: String },
        level:   { type: String },
      },
    ],
    // ── denormalised experiences ─────────────
    experiences: [
      {
        _id:         false,
        id:          { type: Number },
        title:       { type: String },
        company:     { type: String },
        startDate:   { type: String },
        endDate:     { type: String, default: null },
        description: { type: String, default: null },
      },
    ],
    // ── denormalised educations ──────────────
    educations: [
      {
        _id:         false,
        id:          { type: Number },
        degree:      { type: String },
        institution: { type: String },
        startYear:   { type: Number },
        endYear:     { type: Number, default: null },
      },
    ],
    // ── computed stats ───────────────────────
    stats: {
      _id:              false,
      totalApplications: { type: Number, default: 0 },
      skillsListed:      { type: Number, default: 0 },
      workExperiences:   { type: Number, default: 0 },
      educationRecords:  { type: Number, default: 0 },
    },
  },
  { _id: false, timestamps: false, collection: 'candidate_profile_views' }
);

CandidateProfileViewSchema.index({ email: 1 });
CandidateProfileViewSchema.index({ location: 1 });
CandidateProfileViewSchema.index({ 'skills.name': 1 });

module.exports = mongoose.model('CandidateProfileView', CandidateProfileViewSchema);
