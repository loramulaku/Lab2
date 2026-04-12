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

    // Strip undefined keys so partial updates don't overwrite with null
    const data = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );

    const job = await jobMysqlRepo.update(jobId, data);
    if (!job) return null;

    // Re-sync the MongoDB projection — skills/categories may also have changed
    syncJobSafe(jobId);

    return job;
  }
}

module.exports = new UpdateJobHandler();
