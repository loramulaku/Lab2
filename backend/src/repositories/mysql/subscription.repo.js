const Subscription  = require('../../models/sql/Subscription');
const Plan          = require('../../models/sql/Plan');
const createMysqlRepo = require('./_factory');

const base = createMysqlRepo(Subscription);

module.exports = {
  ...base,

  async findActiveByCompanyId(companyId) {
    if (!companyId || !Number.isFinite(Number(companyId))) return null;
    return Subscription.findOne({
      where: { companyId, status: 'active' },
      include: [{ model: Plan, as: 'Plan' }],
    });
  },
};
