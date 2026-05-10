const Company = require('../../models/sql/Company');
const createMysqlRepo = require('./_factory');
const { sequelize } = require('../../config/mysql');

const baseRepo = createMysqlRepo(Company);

module.exports = {
  ...baseRepo,
  
  async findAll({ limit = 10, offset = 0, search = '', sortBy = 'created_at', sortOrder = 'DESC' }) {
    const where = search 
      ? {
          [sequelize.Sequelize.Op.or]: [
            { name: { [sequelize.Sequelize.Op.like]: `%${search}%` } },
            { description: { [sequelize.Sequelize.Op.like]: `%${search}%` } },
          ]
        }
      : {};

    const { count, rows } = await Company.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });

    return { companies: rows, total: count };
  },
};
