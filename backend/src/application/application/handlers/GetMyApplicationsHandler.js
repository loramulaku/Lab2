const applicationRepo = require('../../../repositories/mongodb/application.repo');

/** READ — a candidate's own applications (MongoDB). */
class GetMyApplicationsHandler {
  async handle(query) {
    return applicationRepo.findByUser(query.userId, { status: query.status, page: query.page, limit: query.limit });
  }
}
module.exports = new GetMyApplicationsHandler();
