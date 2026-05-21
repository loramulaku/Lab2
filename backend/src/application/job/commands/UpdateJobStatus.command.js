class UpdateJobStatusCommand {
  constructor(jobId, status) {
    this.jobId  = jobId;
    this.status = status;
  }
}

module.exports = UpdateJobStatusCommand;
