const UserRoleView = require('../../models/nosql/UserRoleView');
const createMongoRepo = require('./_factory');
module.exports = createMongoRepo(UserRoleView);
