const Report = require('../../models/sql/Report');
const createMysqlRepo = require('./_factory');

module.exports = {
  ...createMysqlRepo(Report),

  async findAll({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const { rows, count } = await Report.findAndCountAll({
      order: [['id', 'DESC']],
      limit,
      offset,
    });
    return { data: rows, total: count, page, totalPages: Math.ceil(count / limit) };
  },

  async findByUser(userId) {
    return Report.findAll({ where: { createdBy: userId }, order: [['id', 'DESC']] });
  },
};
