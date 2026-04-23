const JobView        = require('../../models/nosql/JobView');
const createMongoRepo = require('./_factory');
const { paginate }   = require('../../utils/pagination');

/**
 * MongoDB READ repository for JobView.
 * Extends the base factory with job-specific filter queries.
 * Only query handlers should call this.
 */
const jobViewRepo = {
  ...createMongoRepo(JobView),

  async upsert(data) {
    const { id, ...rest } = data;
    return JobView.findOneAndUpdate(
      { _id: id },
      { $set: rest },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  },

  async findAll({ status, workMode, employmentType, companyId, skill, page, limit } = {}) {
    const filter = {};
    if (status)         filter.status         = status;
    if (workMode)       filter.workMode       = workMode;
    if (employmentType) filter.employmentType = employmentType;
    if (companyId)      filter['company.id']  = Number(companyId);
    if (skill)          filter.skills         = skill;
    return paginate(JobView, filter, { page, limit });
  },

  async findByJobId(jobId) {
    return JobView.findById(Number(jobId)).lean();
  },

  async delete(jobId) {
    return JobView.findByIdAndDelete(Number(jobId));
  },
};

module.exports = jobViewRepo;
