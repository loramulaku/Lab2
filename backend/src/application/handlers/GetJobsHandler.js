const jobViewRepo = require('../../repositories/mongodb/jobView.repo');

/**
 * GetJobsHandler
 * Reads the jobs list from the MongoDB read store.
 */
class GetJobsHandler {
  /**
   * @param {import('../../application/queries/GetJobs.query')} query
   * @returns {Promise<{data: object[], total: number, page: number, limit: number}>}
   */
  async handle(query) {
    return jobViewRepo.findAll(query);
  }
}

module.exports = new GetJobsHandler();
