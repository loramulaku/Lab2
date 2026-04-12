const RecruiterProfileView = require('../../models/nosql/RecruiterProfileView');
const createMongoRepo = require('./_factory');

module.exports = createMongoRepo(RecruiterProfileView);
