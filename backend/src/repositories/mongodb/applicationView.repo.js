const ApplicationView = require('../../models/nosql/ApplicationView');
const createMongoRepo = require('./_factory');

const applicationViewRepo = {
  ...createMongoRepo(ApplicationView),

  async findByUser({ userId, page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      ApplicationView.find({ userId }).sort({ appliedAt: -1 }).skip(skip).limit(limit).lean(),
      ApplicationView.countDocuments({ userId }),
    ]);
    return { data, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
  },

  async findByJob({ jobId, page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      ApplicationView.find({ jobId }).sort({ appliedAt: -1 }).skip(skip).limit(limit).lean(),
      ApplicationView.countDocuments({ jobId }),
    ]);
    return { data, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
  },
};

module.exports = applicationViewRepo;
