class UpdateJobCommand {
  constructor(jobId, data) {
    this.jobId          = jobId;
    this.title          = data.title;
    this.description    = data.description;
    this.employmentType = data.employmentType;
    this.workMode       = data.workMode;
    this.jobMode        = data.jobMode;
    this.budgetMin      = data.budgetMin;
    this.budgetMax      = data.budgetMax;
    this.expiresAt      = data.expiresAt;
    this.deadline       = data.deadline;
    this.status         = data.status;
    this.skillIds       = data.skillIds;    // undefined = don't touch
    this.categoryIds    = data.categoryIds; // undefined = don't touch
  }
}
module.exports = UpdateJobCommand;
