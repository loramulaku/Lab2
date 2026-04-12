/**
 * GetJobs Query
 * Carries filter / pagination params for listing jobs from MongoDB read store.
 */
class GetJobsQuery {
  /**
   * @param {object} [filters]
   * @param {string}  [filters.status]
   * @param {string}  [filters.workMode]
   * @param {string}  [filters.employmentType]
   * @param {number}  [filters.companyId]
   * @param {string}  [filters.skill]
   * @param {number}  [filters.page]
   * @param {number}  [filters.limit]
   */
  constructor(filters = {}) {
    this.status         = filters.status;
    this.workMode       = filters.workMode;
    this.employmentType = filters.employmentType;
    this.companyId      = filters.companyId;
    this.skill          = filters.skill;
    this.page           = filters.page  ?? 1;
    this.limit          = filters.limit ?? 20;
  }
}

module.exports = GetJobsQuery;
