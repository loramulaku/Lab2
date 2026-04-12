const ConversationView = require('../../models/nosql/ConversationView');
const createMongoRepo = require('./_factory');
module.exports = createMongoRepo(ConversationView);
