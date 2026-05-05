const { Op }      = require('sequelize');
const Application = require('../../models/sql/Application');
const createMysqlRepo = require('./_factory');

const applicationRepo = {
  ...createMysqlRepo(Application),

  async findByJobAndUser(jobId, userId) {
    return Application.findOne({ where: { jobId, userId } });
  },

  async findByUser(userId) {
    return Application.findAll({ where: { userId }, order: [['applied_at', 'DESC']] });
  },

  async findByJob(jobId) {
    return Application.findAll({ where: { jobId }, order: [['applied_at', 'DESC']] });
  },

  async findByIds(ids) {
    return Application.findAll({ where: { id: { [Op.in]: ids } } });
  },
};

module.exports = applicationRepo;
