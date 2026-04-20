const jobMysqlRepo    = require('../../repositories/mysql/job.repo');
const { syncJobSafe } = require('../../sync/jobSync');

const VALID_STATUSES = ['open', 'closed'];

class UpdateJobStatusHandler {
  async handle(command) {
    const { jobId, status } = command;

    if (!VALID_STATUSES.includes(status)) {
      const err = new Error('status must be open or closed');
      err.status = 400;
      throw err;
    }

    const existing = await jobMysqlRepo.findById(jobId);
    if (!existing) return null;

    const job = await jobMysqlRepo.update(jobId, { status });
    syncJobSafe(jobId);
    return job;
  }
}

module.exports = new UpdateJobStatusHandler();
