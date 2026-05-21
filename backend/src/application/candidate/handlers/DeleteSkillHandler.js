const CandidateSkill        = require('../../../models/sql/CandidateSkill');
const { syncCandidateSafe } = require('../../../sync/candidateSync');

class DeleteSkillHandler {
  async handle(command) {
    const deleted = await CandidateSkill.destroy({ where: { skillId: command.skillId, userId: command.userId } });
    if (!deleted) throw Object.assign(new Error('Skill not found'), { status: 404 });
    syncCandidateSafe(command.userId);
    return { message: 'Skill removed' };
  }
}

module.exports = new DeleteSkillHandler();
