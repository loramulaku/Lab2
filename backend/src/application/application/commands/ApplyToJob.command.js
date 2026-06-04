class ApplyToJobCommand {
  constructor({ userId, jobId }) {
    this.userId = userId;
    this.jobId  = Number(jobId);
  }
}
module.exports = ApplyToJobCommand;
