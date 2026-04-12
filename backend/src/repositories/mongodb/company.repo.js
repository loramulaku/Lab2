const CompanyView = require('../../models/nosql/CompanyView');
const createMongoRepo = require('./_factory');

module.exports = createMongoRepo(CompanyView);
