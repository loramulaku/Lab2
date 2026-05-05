class ApplyToJobCommand {
  constructor({ jobId, userId, coverLetter }) {
    this.jobId       = jobId;
    this.userId      = userId;
    this.coverLetter = coverLetter ?? null;
  }
}

module.exports = ApplyToJobCommand;
