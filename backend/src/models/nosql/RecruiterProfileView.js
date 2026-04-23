const mongoose = require('mongoose');

/**
 * RecruiterProfileView — denormalised read projection for recruiter profiles.
 * _id = MySQL Users.id (userId) for O(1) lookups by user.
 * Company data is embedded so reads require no joins.
 */
const RecruiterProfileViewSchema = new mongoose.Schema(
  {
    _id:         { type: Number },               // MySQL Users.id
    firstName:   { type: String },
    lastName:    { type: String },
    email:       { type: String },
    avatarPath:  { type: String, default: null },
    // ── recruiter profile fields ─────────────
    jobTitle:    { type: String, default: null },
    phone:       { type: String, default: null },
    linkedinUrl: { type: String, default: null },
    // ── denormalised company snapshot ────────
    company: {
      _id:         false,
      id:          { type: Number },
      name:        { type: String },
      industry:    { type: String, default: null },
      location:    { type: String, default: null },
      size:        { type: String, default: null },
      foundedYear: { type: Number, default: null },
      website:     { type: String, default: null },
      description: { type: String, default: null },
      logoPath:    { type: String, default: null },
    },
  },
  { _id: false, timestamps: false, collection: 'recruiter_profile_views' }
);

RecruiterProfileViewSchema.index({ email: 1 });
RecruiterProfileViewSchema.index({ 'company.id': 1 });

module.exports = mongoose.model('RecruiterProfileView', RecruiterProfileViewSchema);
