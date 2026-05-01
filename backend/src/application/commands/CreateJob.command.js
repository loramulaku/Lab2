/**
 * CreateJob Command
 * Carries the intent + validated data needed to create a new job.
 * No business logic here — that lives in CreateJobHandler.
 */
class CreateJobCommand {
  /**
   * @param {object} data
   * @param {number} data.companyId
   * @param {string} data.title
   * @param {string} [data.description]
   * @param {string} [data.employmentType]
   * @param {string} [data.workMode]
   * @param {string} [data.jobMode]
   * @param {number} [data.budgetMin]
   * @param {number} [data.budgetMax]
   * @param {string} [data.expiresAt]
   * @param {string} [data.deadline]
   * @param {number[]} [data.skillIds]
   * @param {number[]} [data.categoryIds]
   * @param {object}  [data.subscription] - Sequelize Subscription instance from checkSubscription middleware
   */
  constructor(data) {
    this.companyId       = data.companyId;
    this.recruiterId     = data.recruiterId;
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
    this.skillIds        = data.skillIds ?? [];
    this.categoryIds     = data.categoryIds ?? [];
    this.subscription    = data.subscription ?? null;
  }
}

module.exports = CreateJobCommand;
