const Education             = require('../../../models/sql/Education');
const { syncCandidateSafe } = require('../../../sync/candidateSync');

class DeleteEducationHandler {
  async handle(command) {
    const deleted = await Education.destroy({ where: { id: command.educationId, userId: command.userId } });
    if (!deleted) throw Object.assign(new Error('Education not found'), { status: 404 });
    syncCandidateSafe(command.userId);
    return { message: 'Deleted' };
  }
}

module.exports = new DeleteEducationHandler();
