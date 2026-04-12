const ConversationParticipant = require('../../models/sql/ConversationParticipant');
const createMysqlRepo = require('./_factory');
module.exports = createMysqlRepo(ConversationParticipant);
