const mongoose = require('mongoose');

/**
 * UserProfile — read-optimised projection of the Users table.
 * _id = MySQL Users.id. Roles, skills, and company info are
 * denormalised for single-document lookups.
 */
const UserProfileSchema = new mongoose.Schema(
  {
    _id:       { type: Number },               // MySQL Users.id
    firstName: { type: String },
    lastName:  { type: String },
    email:     { type: String },
    isActive:  { type: Boolean },
    // ── denormalised ─────────────────────────
    roles:    [String],
    // Candidate-specific
    headline: { type: String },
    bio:      { type: String },
    location: { type: String },
    skills:   [{ name: String, level: String }],
    // Recruiter-specific
    company: {
      id:      { type: Number },
      name:    { type: String },
      website: { type: String },
    },
  },
  { _id: false, timestamps: false, collection: 'user_profiles' }
);

UserProfileSchema.index({ email: 1 });
UserProfileSchema.index({ roles: 1 });

module.exports = mongoose.model('UserProfile', UserProfileSchema);
