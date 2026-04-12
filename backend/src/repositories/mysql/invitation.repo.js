const Invitation = require('../../models/sql/Invitation');
const createMysqlRepo = require('./_factory');
module.exports = createMysqlRepo(Invitation);
