class GetJobApplicationsQuery {
  constructor({ jobId, page, limit }) {
    this.jobId = jobId;
    this.page  = page;
    this.limit = limit;
  }
}
module.exports = GetJobApplicationsQuery;
