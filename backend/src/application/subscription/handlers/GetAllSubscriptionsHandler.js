const subscriptionMongoRepo = require('../../../repositories/mongodb/subscription.repo');

class GetAllSubscriptionsHandler {
  async handle(query) {
    return subscriptionMongoRepo.findAll({}, { page: query.page, limit: query.limit });
  }
}

module.exports = new GetAllSubscriptionsHandler();
