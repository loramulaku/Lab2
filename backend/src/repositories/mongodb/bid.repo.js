const BidView        = require('../../models/nosql/BidView');
const createMongoRepo = require('./_factory');
const { paginate }   = require('../../utils/pagination');

module.exports = {
  ...createMongoRepo(BidView),

  async findByFreelancer(freelancerId, { status, page, limit } = {}) {
    const filter = { freelancerId: Number(freelancerId) };
    if (status) filter.status = status;
    return paginate(BidView, filter, { page, limit });
  },

  async findByCompany(companyId, { status, page, limit } = {}) {
    const filter = { companyId: Number(companyId) };
    if (status) filter.status = status;
    return paginate(BidView, filter, { page, limit });
  },
};
