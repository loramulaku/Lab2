const Education             = require('../../../models/sql/Education');
const { syncCandidateSafe } = require('../../../sync/candidateSync');

class AddEducationHandler {
  async handle(command) {
    const { userId, degree, institution, startYear, endYear } = command;
    if (!degree || !institution || !startYear) {
      throw Object.assign(new Error('degree, institution, startYear are required'), { status: 400 });
    }
    const edu = await Education.create({ userId, degree, institution, startYear, endYear });
    syncCandidateSafe(userId);
    return edu;
  }
}

module.exports = new AddEducationHandler();
