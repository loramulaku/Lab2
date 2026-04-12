const ContractView = require('../../models/nosql/ContractView');
const createMongoRepo = require('./_factory');
module.exports = createMongoRepo(ContractView);
