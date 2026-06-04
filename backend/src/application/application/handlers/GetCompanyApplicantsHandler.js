const applicationRepo = require('../../../repositories/mongodb/application.repo');

/** READ — applicants (job seekers) for a recruiter's company (MongoDB). */
class GetCompanyApplicantsHandler {
  async handle(query) {
    if (!query.companyId) return { data: [], page: query.page, limit: query.limit, total: 0 };
    return applicationRepo.findByCompany(query.companyId, { status: query.status, page: query.page, limit: query.limit });
  }
}
module.exports = new GetCompanyApplicantsHandler();
