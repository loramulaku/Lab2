const Skill                 = require('../../../models/sql/Skill');
const CandidateSkill        = require('../../../models/sql/CandidateSkill');
const { syncCandidateSafe } = require('../../../sync/candidateSync');

const ALLOWED_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

class AddSkillHandler {
  async handle(command) {
    const { userId, name, level } = command;
    if (!name?.trim()) throw Object.assign(new Error('Skill name is required'), { status: 400 });

    const safeLevel = ALLOWED_LEVELS.includes(level) ? level : 'Intermediate';
    const [skill]   = await Skill.findOrCreate({ where: { name: name.trim() } });

    const existing = await CandidateSkill.findOne({ where: { userId, skillId: skill.id } });
    if (existing) throw Object.assign(new Error('Skill already added'), { status: 409 });

    const cs = await CandidateSkill.create({ userId, skillId: skill.id, level: safeLevel });
    syncCandidateSafe(userId);
    return { id: cs.id, skillId: skill.id, name: skill.name, level: safeLevel };
  }
}

module.exports = new AddSkillHandler();
