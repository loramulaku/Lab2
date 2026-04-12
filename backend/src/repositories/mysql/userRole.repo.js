const UserRole = require('../../models/sql/UserRole');
const createMysqlRepo = require('./_factory');
module.exports = createMysqlRepo(UserRole);
