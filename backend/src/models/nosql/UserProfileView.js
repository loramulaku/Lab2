const mongoose = require('mongoose');

/**
 * UserProfileView — read-optimised projection of the Users table.
 * _id = MySQL Users.id. Roles are denormalised for single-document lookups.
 * Used by admin queries and generic user lookups.
 * Candidate-specific reads use CandidateProfileView.
 * Recruiter-specific reads use RecruiterProfileView.
 */
const UserProfileViewSchema = new mongoose.Schema(
  {
    _id:       { type: Number },               // MySQL Users.id
    firstName: { type: String },
    lastName:  { type: String },
    email:     { type: String },
    isActive:  { type: Boolean },
    avatarPath: { type: String, default: null },
    roles:     [String],
  },
  { _id: false, timestamps: false, collection: 'user_profile_views' }
);

UserProfileViewSchema.index({ email: 1 });
UserProfileViewSchema.index({ roles: 1 });

module.exports = mongoose.model('UserProfileView', UserProfileViewSchema);
