const StageHistory    = require('../../models/sql/StageHistory');
const createMysqlRepo = require('./_factory');
module.exports = createMysqlRepo(StageHistory);
