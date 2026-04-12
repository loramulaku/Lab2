const JobCategory = require('../../models/sql/JobCategory');
const createMysqlRepo = require('./_factory');
module.exports = createMysqlRepo(JobCategory);
