/**
 * UpdateJob Command
 * Carries the intent + validated data needed to update an existing job.
 */
class UpdateJobCommand {
  /**
   * @param {number} jobId
   * @param {object} data
   */
  constructor(jobId, data) {
    this.jobId           = jobId;
    this.title           = data.title;
    this.description     = data.description;
    this.employmentType  = data.employmentType;
    this.experienceLevel = data.experienceLevel;
    this.workMode        = data.workMode;
    this.jobMode         = data.jobMode;
    this.budgetMin       = data.budgetMin;
    this.budgetMax       = data.budgetMax;
    this.expiresAt       = data.expiresAt;
    this.deadline        = data.deadline;
    this.skillIds        = data.skillIds;
    this.categoryIds     = data.categoryIds;
  }
}

module.exports = UpdateJobCommand;
