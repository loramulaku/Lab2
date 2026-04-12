const mongoose = require('mongoose');

/**
 * CandidateSkillView — read-optimised projection of the CandidateSkills table.
 * _id = MySQL CandidateSkills.id. Skill name and user full name are
 * denormalised so reads never require a join.
 */
const CandidateSkillViewSchema = new mongoose.Schema(
  {
    _id:          { type: Number },          // MySQL CandidateSkills.id
    userId:       { type: Number },
    skillId:      { type: Number },
    level:        { type: String },
    // ── denormalised ─────────────────────────
    skillName:    { type: String },
    userFullName: { type: String },
  },
  { _id: false, timestamps: false, collection: 'candidate_skill_views' }
);

CandidateSkillViewSchema.index({ userId: 1 });
CandidateSkillViewSchema.index({ skillId: 1 });

module.exports = mongoose.model('CandidateSkillView', CandidateSkillViewSchema);
