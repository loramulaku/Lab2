const Application    = require('../../models/sql/Application');
const createMysqlRepo = require('./_factory');
module.exports = createMysqlRepo(Application);
