/**
 * GetJobById Query
 * Carries the jobId needed to fetch a single job from the MongoDB read store.
 */
class GetJobByIdQuery {
  /**
   * @param {number} jobId
   */
  constructor(jobId) {
    this.jobId = jobId;
  }
}

module.exports = GetJobByIdQuery;
