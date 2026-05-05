const applicationViewRepo = require('../../repositories/mongodb/applicationView.repo');

class GetMyApplicationsHandler {
  async handle(query) {
    return applicationViewRepo.findByUser({ userId: query.userId, page: query.page, limit: query.limit });
  }
}

module.exports = new GetMyApplicationsHandler();
