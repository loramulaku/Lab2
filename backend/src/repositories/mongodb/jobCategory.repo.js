const JobCategoryView = require('../../models/nosql/JobCategoryView');
const createMongoRepo = require('./_factory');
module.exports = createMongoRepo(JobCategoryView);
