const CandidateProfileView = require('../../models/nosql/CandidateProfileView');
const createMongoRepo = require('./_factory');

module.exports = createMongoRepo(CandidateProfileView);
