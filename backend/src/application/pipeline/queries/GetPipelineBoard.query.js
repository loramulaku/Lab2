class GetPipelineBoardQuery {
  constructor(companyId, search) {
    this.companyId = companyId;
    this.search    = search || null;
  }
}
module.exports = GetPipelineBoardQuery;
