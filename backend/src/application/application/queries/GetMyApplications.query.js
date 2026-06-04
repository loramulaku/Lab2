class GetMyApplicationsQuery {
  constructor(userId, filters = {}) {
    this.userId = userId;
    this.status = filters.status;
    this.page   = filters.page  ?? 1;
    this.limit  = filters.limit ?? 20;
  }
}
module.exports = GetMyApplicationsQuery;
