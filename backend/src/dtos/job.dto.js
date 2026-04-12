/**
 * JobDTO — shapes the public-facing job response.
 * Strips internal fields and normalises naming for the API consumer.
 */
class JobDTO {
  constructor(job) {
    this.id             = job.id ?? job.jobId;
    this.title          = job.title;
    this.description    = job.description;
    this.employmentType = job.employmentType;
    this.workMode       = job.workMode;
    this.jobMode        = job.jobMode;
    this.budgetMin      = job.budgetMin;
    this.budgetMax      = job.budgetMax;
    this.status         = job.status;
    this.expiresAt      = job.expiresAt;
    this.deadline       = job.deadline;
    this.company        = job.company ?? null;
    this.skills         = job.skills    ?? [];
    this.categories     = job.categories ?? [];
    this.createdAt      = job.createdAt;
  }

  static from(job) {
    return new JobDTO(job);
  }

  static fromList(jobs) {
    return jobs.map(JobDTO.from);
  }
}

module.exports = JobDTO;
