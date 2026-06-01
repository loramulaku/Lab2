const bidViewRepo = require('../../../repositories/mongodb/bid.repo');

class GetMyBidsHandler {
  async handle(query) {
    const filter = { freelancerId: Number(query.freelancerId) };
    if (query.status) filter.status = query.status;
    return bidViewRepo.findAll(filter, { page: query.page, limit: query.limit });
  }
}

module.exports = new GetMyBidsHandler();
