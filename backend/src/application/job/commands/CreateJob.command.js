class CreateJobCommand {
  constructor(data) {
    this.companyId      = data.companyId;
    this.title          = data.title;
    this.description    = data.description;
    this.employmentType = data.employmentType;
    this.workMode       = data.workMode;
    this.jobMode        = data.jobMode;
    this.budgetMin      = data.budgetMin;
    this.budgetMax      = data.budgetMax;
    this.expiresAt      = data.expiresAt;
    this.deadline       = data.deadline;
    this.skillIds       = data.skillIds    ?? [];
    this.categoryIds    = data.categoryIds ?? [];
  }
}
module.exports = CreateJobCommand;
