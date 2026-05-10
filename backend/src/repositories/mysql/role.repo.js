const Role = require('../../models/sql/Role');
const createMysqlRepo = require('./_factory');

const baseRepo = createMysqlRepo(Role);

module.exports = {
  ...baseRepo,
  
  async findAll() {
    return Role.findAll();
  },

  async findByName(name) {
    return Role.findOne({ where: { name } });
  },
};
