const invitationViewRepo = require('../../repositories/mongodb/invitationView.repo');

class GetMyInvitationsHandler {
  async handle(query) {
    return invitationViewRepo.findByFreelancer({ freelancerId: query.userId, page: query.page, limit: query.limit });
  }
}

module.exports = new GetMyInvitationsHandler();
