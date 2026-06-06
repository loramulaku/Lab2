const Export = require('../../models/sql/Export');
const createMysqlRepo = require('./_factory');

module.exports = {
  ...createMysqlRepo(Export),

  async findByUser(userId, limit = 50) {
    return Export.findAll({
      where: { userId },
      order: [['created_at', 'DESC']],
      limit,
    });
  },
};
