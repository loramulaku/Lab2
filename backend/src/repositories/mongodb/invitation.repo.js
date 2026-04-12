const InvitationView = require('../../models/nosql/InvitationView');
const createMongoRepo = require('./_factory');
module.exports = createMongoRepo(InvitationView);
