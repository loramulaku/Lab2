const Experience            = require('../../../models/sql/Experience');
const { syncCandidateSafe } = require('../../../sync/candidateSync');

class UpdateExperienceHandler {
  async handle(command) {
    const { userId, experienceId, title, company, startDate, endDate, description } = command;
    const [count] = await Experience.update(
      { title, company, startDate, endDate, description },
      { where: { id: experienceId, userId } }
    );
    if (!count) throw Object.assign(new Error('Experience not found'), { status: 404 });
    syncCandidateSafe(userId);
    return Experience.findByPk(experienceId);
  }
}

module.exports = new UpdateExperienceHandler();
