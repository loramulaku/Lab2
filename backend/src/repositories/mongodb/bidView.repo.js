const BidView = require('../../models/nosql/BidView');
const createMongoRepo = require('./_factory');

const bidViewRepo = {
  ...createMongoRepo(BidView),

  async upsert(data) {
    const { id, ...rest } = data;
    return BidView.findOneAndUpdate(
      { _id: id },
      { $set: rest },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  },

  async findByJob({ jobId, page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      BidView.find({ jobId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      BidView.countDocuments({ jobId }),
    ]);
    return { data, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
  },

  async findByFreelancer({ freelancerId, page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      BidView.find({ freelancerId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      BidView.countDocuments({ freelancerId }),
    ]);
    return { data, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
  },
};

module.exports = bidViewRepo;
