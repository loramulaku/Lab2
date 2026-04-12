const mongoose = require('mongoose');

/**
 * SkillView — read-optimised projection of the Skills table.
 * _id = MySQL Skills.id.
 */
const SkillViewSchema = new mongoose.Schema(
  {
    _id:  { type: Number },          // MySQL Skills.id
    name: { type: String },
  },
  { _id: false, timestamps: false, collection: 'skill_views' }
);

SkillViewSchema.index({ name: 1 });

module.exports = mongoose.model('SkillView', SkillViewSchema);
