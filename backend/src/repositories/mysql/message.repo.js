const Message = require('../../models/sql/Message');
const createMysqlRepo = require('./_factory');
module.exports = createMysqlRepo(Message);
