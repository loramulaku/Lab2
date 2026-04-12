const Conversation = require('../../models/sql/Conversation');
const createMysqlRepo = require('./_factory');
module.exports = createMysqlRepo(Conversation);
