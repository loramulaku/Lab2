class GetMyContractsQuery {
  /**
   * @param {{ freelancerId?: number, companyId?: number, status?: string, page?: number, limit?: number }} opts
   */
  constructor(opts = {}) {
    this.freelancerId = opts.freelancerId;
    this.companyId    = opts.companyId;
    this.status       = opts.status;
    this.page         = opts.page  ?? 1;
    this.limit        = opts.limit ?? 20;
  }
}
module.exports = GetMyContractsQuery;
