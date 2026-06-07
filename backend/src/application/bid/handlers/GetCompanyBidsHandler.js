const bidRepo = require('../../../repositories/mongodb/bid.repo');

/** READ — bids placed on a recruiter's company jobs (MongoDB). */
class GetCompanyBidsHandler {
  async handle(query) {
    if (!query.companyId) return { data: [], page: query.page, limit: query.limit, total: 0 };
    return bidRepo.findByCompany(query.companyId, {
      status: query.status,
      page:   query.page,
      limit:  query.limit,
    });
  }
}

module.exports = new GetCompanyBidsHandler();
