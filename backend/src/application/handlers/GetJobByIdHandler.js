const jobViewRepo = require('../../repositories/mongodb/jobView.repo');

/**
 * GetJobByIdHandler
 * Reads a single job from the MongoDB read store.
 */
class GetJobByIdHandler {
  /**
   * @param {import('../queries/GetJobById.query')} query
   * @returns {Promise<object|null>}
   */
  async handle(query) {
    return jobViewRepo.findByJobId(query.jobId);
  }
}

module.exports = new GetJobByIdHandler();
