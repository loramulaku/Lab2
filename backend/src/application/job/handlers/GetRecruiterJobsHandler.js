const jobViewRepo = require('../../../repositories/mongodb/jobView.repo');

/**
 * READ — list all jobs for the recruiter's own company from MongoDB.
 *
 * Unlike the public GetJobsHandler, this does NOT apply the excludeInviteOnly
 * filter — recruiters must be able to see every job they posted, including
 * invite-only freelance jobs.
 */
class GetRecruiterJobsHandler {
  async handle(query) {
    if (!query.companyId) return { data: [], total: 0, page: 1, limit: query.limit };
    return jobViewRepo.findAll({
      companyId:      query.companyId,
      q:              query.q,
      status:         query.status,
      employmentType: query.employmentType,
      page:           query.page,
      limit:          query.limit,
    });
  }
}

module.exports = new GetRecruiterJobsHandler();
