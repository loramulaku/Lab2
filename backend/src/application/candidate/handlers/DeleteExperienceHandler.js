const Experience            = require('../../../models/sql/Experience');
const { syncCandidateSafe } = require('../../../sync/candidateSync');

class DeleteExperienceHandler {
  async handle(command) {
    const deleted = await Experience.destroy({ where: { id: command.experienceId, userId: command.userId } });
    if (!deleted) throw Object.assign(new Error('Experience not found'), { status: 404 });
    syncCandidateSafe(command.userId);
    return { message: 'Deleted' };
  }
}

module.exports = new DeleteExperienceHandler();
