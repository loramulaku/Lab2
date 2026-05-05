const bidViewRepo = require('../../repositories/mongodb/bidView.repo');

class GetJobBidsHandler {
  async handle(query) {
    return bidViewRepo.findByJob({ jobId: query.jobId, page: query.page, limit: query.limit });
  }
}

module.exports = new GetJobBidsHandler();
