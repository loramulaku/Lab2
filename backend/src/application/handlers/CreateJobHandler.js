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
    // 1. WRITE → MySQL (source of truth)
    const job = await jobMysqlRepo.create(command);

    // 2. SYNC → MongoDB read store (fire-and-forget)
    syncJobSafe(job.id);

    return job;
  }
}

module.exports = new CreateJobHandler();
