const Experience            = require('../../../models/sql/Experience');
const { syncCandidateSafe } = require('../../../sync/candidateSync');

class AddExperienceHandler {
  async handle(command) {
    const { userId, title, company, startDate, endDate, description } = command;
    if (!title || !company || !startDate) {
      throw Object.assign(new Error('title, company, startDate are required'), { status: 400 });
    }
    const exp = await Experience.create({ userId, title, company, startDate, endDate, description });
    syncCandidateSafe(userId);
    return exp;
  }
}

module.exports = new AddExperienceHandler();
