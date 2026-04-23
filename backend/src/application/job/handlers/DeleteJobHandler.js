const jobMysqlRepo = require('../../../repositories/mysql/job.repo');
const jobViewRepo  = require('../../../repositories/mongodb/jobView.repo');
const FailedSync   = require('../../../models/sql/FailedSync');

class DeleteJobHandler {
  async handle(command) {
    const deleted = await jobMysqlRepo.delete(command.jobId);
    if (!deleted) return null;
    // Remove MongoDB view and any pending retry record together.
    await Promise.all([
      jobViewRepo.delete(command.jobId),
      FailedSync.destroy({ where: { entityType: 'job', entityId: command.jobId } }),
    ]);
    return { message: 'Job deleted' };
  }
}

module.exports = new DeleteJobHandler();
