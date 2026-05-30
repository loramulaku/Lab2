const planMongoRepo = require('../../../repositories/mongodb/plan.repo');

class GetPlansHandler {
  async handle(query) {
    const filter = query.activeOnly ? { isActive: true } : {};
    return planMongoRepo.findAll(filter, { limit: 100 });
  }
}

module.exports = new GetPlansHandler();
