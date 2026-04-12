const ConversationParticipantView = require('../../models/nosql/ConversationParticipantView');
const createMongoRepo = require('./_factory');
module.exports = createMongoRepo(ConversationParticipantView);
