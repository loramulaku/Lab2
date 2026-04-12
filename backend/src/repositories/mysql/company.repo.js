const Company = require('../../models/sql/Company');
const createMysqlRepo = require('./_factory');

module.exports = createMysqlRepo(Company);
