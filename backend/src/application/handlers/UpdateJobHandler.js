const jobMysqlRepo    = require('../../repositories/mysql/job.repo');
const { syncJobSafe } = require('../../sync/jobSync');

/**
 * UpdateJobHandler
 *
 * WRITE path:
 *   1. Updates the job row (and optionally skill/category links) in MySQL
 *   2. Triggers a fire-and-forget re-sync of the MongoDB read projection
 */
class UpdateJobHandler {
  /**
   * @param {import('../commands/UpdateJob.command')} command
   * @returns {Promise<object>} the updated Sequelize Job instance
   */
  async handle(command) {
    const { jobId, ...fields } = command;

    const existing = await jobMysqlRepo.findById(jobId);
    if (!existing) return null;

    if (existing.status === 'closed') {
      const err = new Error('Cannot edit a closed job');
      err.status = 400;
      throw err;
    }

    const data = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );

    const job = await jobMysqlRepo.update(jobId, data);
    if (!job) return null;

    syncJobSafe(jobId);
    return job;
  }
}

module.exports = new UpdateJobHandler();
