class GetJobsQuery {
  constructor(filters = {}) {
    this.status             = filters.status;
    this.workMode           = filters.workMode;
    this.employmentType     = filters.employmentType;
    this.experienceLevel    = filters.experienceLevel;
    this.companyId          = filters.companyId;
    this.skill              = filters.skill;
    this.category           = filters.category;
    this.q                  = filters.q;
    this.location           = filters.location;
    this.minSalary          = filters.minSalary;
    this.maxSalary          = filters.maxSalary;
    this.sort               = filters.sort;
    this.page               = filters.page  ?? 1;
    this.limit              = filters.limit ?? 20;
    // When true, exclude freelance jobs that only accept direct invitations
    // (jobMode = 'invite') — candidates cannot apply to them anyway.
    this.excludeInviteOnly  = filters.excludeInviteOnly ?? false;
  }
}
module.exports = GetJobsQuery;
