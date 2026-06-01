class GetBidsByJobQuery {
  constructor(jobId, filters = {}) {
    this.jobId  = jobId;
    this.status = filters.status;
    this.page   = filters.page  ?? 1;
    this.limit  = filters.limit ?? 20;
  }
}
module.exports = GetBidsByJobQuery;
