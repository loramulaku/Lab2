const RefreshToken = require('../../models/sql/RefreshToken');
const createMysqlRepo = require('./_factory');
module.exports = createMysqlRepo(RefreshToken);
