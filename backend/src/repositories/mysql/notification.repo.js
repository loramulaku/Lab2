const Notification = require('../../models/sql/Notification');
const createMysqlRepo = require('./_factory');
module.exports = createMysqlRepo(Notification);
