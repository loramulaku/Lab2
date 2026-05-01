const Subscription    = require('../../models/sql/Subscription');
const createMysqlRepo = require('./_factory');

module.exports = {
  ...createMysqlRepo(Subscription),

  async findActiveByCompany(companyId) {
    return Subscription.findOne({ where: { companyId, status: 'active' } });
  },
};
