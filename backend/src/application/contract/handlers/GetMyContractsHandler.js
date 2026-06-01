const contractViewRepo = require('../../../repositories/mongodb/contract.repo');

class GetMyContractsHandler {
  async handle(query) {
    const filter = {};
    if (query.freelancerId) filter.freelancerId = Number(query.freelancerId);
    if (query.companyId)    filter.companyId    = Number(query.companyId);
    if (query.status)       filter.status       = query.status;
    return contractViewRepo.findAll(filter, { page: query.page, limit: query.limit });
  }
}

module.exports = new GetMyContractsHandler();
