const { sequelize }  = require('../../config/mysql');
const jobMysqlRepo   = require('../../repositories/mysql/job.repo');
const { syncJobSafe } = require('../../sync/jobSync');

/**
 * CreateJobHandler
 *
 * WRITE path:
 *   1. Opens a Sequelize transaction
 *   2. Persists the new job (+ skill/category links) to MySQL  ← source of truth
 *   3. Increments subscription.jobsPostedCount atomically in the same transaction
 *      so a failed increment rolls back the job insert and vice-versa
 *   4. Triggers a fire-and-forget sync to the MongoDB read store (outside the
 *      transaction — sync failures never roll back a successfully created job)
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

    const job = await sequelize.transaction(async (t) => {
      const created = await jobMysqlRepo.create(command, { transaction: t });

      if (command.subscription) {
        command.subscription.jobsPostedCount += 1;
        await command.subscription.save({ transaction: t });
      }

      return created;
    });

    syncJobSafe(job.id);
    return job;
  }
}

module.exports = new CreateJobHandler();
