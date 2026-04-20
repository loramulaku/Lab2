const jobMysqlRepo   = require('../../repositories/mysql/job.repo');
const { syncJobSafe } = require('../../sync/jobSync');

/**
 * CreateJobHandler
 *
 * WRITE path:
 *   1. Persists the new job (+ skill/category links) to MySQL  ← source of truth
 *   2. Triggers a fire-and-forget sync to the MongoDB read store
 *
 * The sync is intentionally non-blocking: if it fails, the job is still
 * created successfully in MySQL.  A background process or retry queue can
 * re-sync later if needed.
 */
class CreateJobHandler {
  /**
   * @param {import('../commands/CreateJob.command')} command
   * @returns {Promise<object>} the created Sequelize Job instance
   */
  async handle(command) {
    const VALID_TYPES = ['full-time', 'freelance'];
    if (!command.employmentType || !VALID_TYPES.includes(command.employmentType)) {
      const err = new Error('employmentType is required and must be full-time or freelance');
      err.status = 400;
      throw err;
    }

    const job = await jobMysqlRepo.create(command);
    syncJobSafe(job.id);
    return job;
  }
}

module.exports = new CreateJobHandler();
