const InvitationView = require('../../models/nosql/InvitationView');
const createMongoRepo = require('./_factory');

const invitationViewRepo = {
  ...createMongoRepo(InvitationView),

  async upsert(data) {
    const { id, ...rest } = data;
    return InvitationView.findOneAndUpdate(
      { _id: id },
      { $set: rest },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  },

  async findByFreelancer({ freelancerId, page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      InvitationView.find({ freelancerId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      InvitationView.countDocuments({ freelancerId }),
    ]);
    return { data, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
  },

  async findByCompany({ companyId, page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      InvitationView.find({ companyId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      InvitationView.countDocuments({ companyId }),
    ]);
    return { data, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) };
  },
};

module.exports = invitationViewRepo;
