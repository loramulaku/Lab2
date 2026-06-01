const bidViewRepo = require('../../../repositories/mongodb/bid.repo');

class GetBidsByJobHandler {
  async handle(query) {
    const filter = { jobId: Number(query.jobId) };
    if (query.status) filter.status = query.status;
    return bidViewRepo.findAll(filter, { page: query.page, limit: query.limit });
  }
}

module.exports = new GetBidsByJobHandler();
