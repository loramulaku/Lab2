const Payment = require('../../models/sql/Payment');
const createMysqlRepo = require('./_factory');

module.exports = createMysqlRepo(Payment);
