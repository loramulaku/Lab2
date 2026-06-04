class GetCompanyApplicantsQuery {
  constructor(companyId, filters = {}) {
    this.companyId = companyId;
    this.status    = filters.status;
    this.page      = filters.page  ?? 1;
    this.limit     = filters.limit ?? 50;
  }
}
module.exports = GetCompanyApplicantsQuery;
