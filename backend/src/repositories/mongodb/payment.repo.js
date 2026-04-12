const PaymentView = require('../../models/nosql/PaymentView');
const createMongoRepo = require('./_factory');

module.exports = createMongoRepo(PaymentView);
