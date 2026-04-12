const Bid = require('../../models/sql/Bid');
const createMysqlRepo = require('./_factory');
module.exports = createMysqlRepo(Bid);
