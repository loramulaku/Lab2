class GetCompanyBidsQuery {
  constructor(companyId, filters = {}) {
    this.companyId = companyId;
    this.status    = filters.status;
    this.page      = filters.page  ?? 1;
    this.limit      = filters.limit ?? 20;
  }
}
module.exports = GetCompanyBidsQuery;
