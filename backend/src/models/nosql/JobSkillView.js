const mongoose = require('mongoose');

/**
 * JobSkillView — read-optimised projection of the JobSkills table.
 * _id = MySQL JobSkills.id. Skill name and job title are denormalised
 * so reads never require a join.
 */
const JobSkillViewSchema = new mongoose.Schema(
  {
    _id:       { type: Number },          // MySQL JobSkills.id
    jobId:     { type: Number },
    skillId:   { type: Number },
    // ── denormalised ─────────────────────────
    skillName: { type: String },
    jobTitle:  { type: String },
  },
  { _id: false, timestamps: false, collection: 'job_skill_views' }
);

JobSkillViewSchema.index({ jobId: 1 });
JobSkillViewSchema.index({ skillId: 1 });

module.exports = mongoose.model('JobSkillView', JobSkillViewSchema);
