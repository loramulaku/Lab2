const ApplicationView  = require('../../models/nosql/ApplicationView');
const createMongoRepo  = require('./_factory');
module.exports = createMongoRepo(ApplicationView);
