const invitationViewRepo = require('../../../repositories/mongodb/invitation.repo');

class GetMyInvitationsHandler {
  async handle(query) {
    const filter = { freelancerId: Number(query.freelancerId) };
    if (query.status) filter.status = query.status;
    return invitationViewRepo.findAll(filter, { page: query.page, limit: query.limit });
  }
}

module.exports = new GetMyInvitationsHandler();
