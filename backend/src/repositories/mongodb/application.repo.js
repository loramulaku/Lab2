const ApplicationView  = require('../../models/nosql/ApplicationView');
const createMongoRepo  = require('./_factory');
const { paginate }     = require('../../utils/pagination');

/**
 * MongoDB READ repository for ApplicationView.
 * Only query handlers should call this.
 */
module.exports = {
  ...createMongoRepo(ApplicationView),

  async findByUser(userId, { status, page, limit } = {}) {
    const filter = { userId: Number(userId) };
    if (status) filter.status = status;
    return paginate(ApplicationView, filter, { page, limit });
  },

  async findByCompany(companyId, { status, page, limit, jobEmploymentType } = {}) {
    const filter = { companyId: Number(companyId) };
    if (status) filter.status = status;
    if (jobEmploymentType) filter.jobEmploymentType = jobEmploymentType;
    return paginate(ApplicationView, filter, { page, limit });
  },
};
