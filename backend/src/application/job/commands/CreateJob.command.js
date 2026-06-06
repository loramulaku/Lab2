class CreateJobCommand {
  constructor(data) {
    this.companyId        = data.companyId;
    this.recruiterId      = data.recruiterId;
    this.title            = data.title;
    this.description      = data.description;
    this.employmentType   = data.employmentType;
    this.experienceLevel  = data.experienceLevel ?? null;
    this.workMode         = data.workMode;
    this.jobMode          = data.jobMode;
    this.budgetMin        = data.budgetMin;
    this.budgetMax        = data.budgetMax;
    this.expiresAt        = data.expiresAt;
    this.deadline         = data.deadline;
    this.responsibilities = data.responsibilities ?? null;
    this.requirements     = data.requirements     ?? null;
    this.niceToHave       = data.niceToHave       ?? null;
    this.benefits         = data.benefits         ?? null;
    this.schedule         = data.schedule         ?? null;
    this.categoryId       = data.categoryId       ?? null;
    this.skillIds         = data.skillIds    ?? [];
    this.categoryIds      = data.categoryIds ?? [];
    this.invitees         = data.invitees    ?? [];
  }
}
module.exports = CreateJobCommand;
