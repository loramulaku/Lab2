/**
 * JobDTO — shapes the public-facing job response.
 * Strips internal fields and normalises naming for the API consumer.
 */
class JobDTO {
  constructor(job) {
    this.id              = job._id ?? job.id ?? job.jobId;
    this.recruiterId     = job.recruiterId ?? null;
    this.title           = job.title;
    this.description     = job.description;
    this.employmentType  = job.employmentType;
    this.experienceLevel = job.experienceLevel ?? null;
    this.workMode        = job.workMode;
    // Expose whether candidates can submit bids without revealing the internal A/B/C mode
    this.acceptsBids     = job.workMode === 'freelance' && ['public', 'both'].includes(job.jobMode);
    this.budgetMin       = job.budgetMin;
    this.budgetMax       = job.budgetMax;
    this.status          = job.status;
    this.expiresAt       = job.expiresAt;
    this.deadline        = job.deadline;
    this.company         = job.company ?? null;
    this.responsibilities = job.responsibilities ?? null;
    this.requirements     = job.requirements     ?? null;
    this.niceToHave       = job.niceToHave       ?? null;
    this.benefits         = job.benefits         ?? null;
    this.skills           = job.skills      ?? [];
    this.categories       = job.categories  ?? [];
    this.schedule         = job.schedule    ?? null;
    this.createdAt        = job.createdAt;
  }

  static from(job) {
    return new JobDTO(job);
  }

  static fromList(jobs) {
    return jobs.map(JobDTO.from);
  }
}

module.exports = JobDTO;
