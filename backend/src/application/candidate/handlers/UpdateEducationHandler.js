const Education             = require('../../../models/sql/Education');
const { syncCandidateSafe } = require('../../../sync/candidateSync');

class UpdateEducationHandler {
  async handle(command) {
    const { userId, educationId, degree, institution, startYear, endYear } = command;
    const [count] = await Education.update(
      { degree, institution, startYear, endYear },
      { where: { id: educationId, userId } }
    );
    if (!count) throw Object.assign(new Error('Education not found'), { status: 404 });
    syncCandidateSafe(userId);
    return Education.findByPk(educationId);
  }
}

module.exports = new UpdateEducationHandler();
