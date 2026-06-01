const invitationViewRepo = require('../../../repositories/mongodb/invitation.repo');

class GetInvitationsByJobHandler {
  async handle(query) {
    const filter = { jobId: Number(query.jobId) };
    if (query.status) filter.status = query.status;
    return invitationViewRepo.findAll(filter, { page: query.page, limit: query.limit });
  }
}

module.exports = new GetInvitationsByJobHandler();
