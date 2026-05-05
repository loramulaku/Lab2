const applicationViewRepo = require('../../repositories/mongodb/applicationView.repo');

class GetJobApplicationsHandler {
  async handle(query) {
    return applicationViewRepo.findByJob({ jobId: query.jobId, page: query.page, limit: query.limit });
  }
}

module.exports = new GetJobApplicationsHandler();
