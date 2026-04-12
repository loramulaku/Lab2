const CandidateProfile = require('../../models/sql/CandidateProfile');
const createMysqlRepo = require('./_factory');

module.exports = createMysqlRepo(CandidateProfile);
