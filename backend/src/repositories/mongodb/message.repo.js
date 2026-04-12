const MessageView = require('../../models/nosql/MessageView');
const createMongoRepo = require('./_factory');
module.exports = createMongoRepo(MessageView);
