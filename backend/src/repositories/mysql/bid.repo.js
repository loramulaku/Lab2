const Bid = require('../../models/sql/Bid');
const createMysqlRepo = require('./_factory');

const bidRepo = {
  ...createMysqlRepo(Bid),

  async findByJobAndFreelancer(jobId, freelancerId) {
    return Bid.findOne({ where: { jobId, freelancerId } });
  },

  async findByJob(jobId) {
    return Bid.findAll({ where: { jobId }, order: [['created_at', 'DESC']] });
  },

  async findByFreelancer(freelancerId) {
    return Bid.findAll({ where: { freelancerId }, order: [['created_at', 'DESC']] });
  },
};

module.exports = bidRepo;
