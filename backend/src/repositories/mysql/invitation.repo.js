const Invitation = require('../../models/sql/Invitation');
const createMysqlRepo = require('./_factory');

const invitationRepo = {
  ...createMysqlRepo(Invitation),

  async findByFreelancer(freelancerId) {
    return Invitation.findAll({ where: { freelancerId }, order: [['created_at', 'DESC']] });
  },

  async findByCompany(companyId) {
    return Invitation.findAll({ where: { companyId }, order: [['created_at', 'DESC']] });
  },
};

module.exports = invitationRepo;
