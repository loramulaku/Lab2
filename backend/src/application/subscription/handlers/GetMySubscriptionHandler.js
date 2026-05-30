const subscriptionMongoRepo = require('../../../repositories/mongodb/subscription.repo');

class GetMySubscriptionHandler {
  async handle(query) {
    const result = await subscriptionMongoRepo.findAll(
      { companyId: query.companyId, status: { $in: ['active', 'past_due'] } },
      { limit: 1 }
    );
    return result.data[0] ?? null;
  }
}

module.exports = new GetMySubscriptionHandler();
