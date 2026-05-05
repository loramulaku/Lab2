const bidViewRepo = require('../../repositories/mongodb/bidView.repo');

class GetMyBidsHandler {
  async handle(query) {
    return bidViewRepo.findByFreelancer({ freelancerId: query.userId, page: query.page, limit: query.limit });
  }
}

module.exports = new GetMyBidsHandler();
