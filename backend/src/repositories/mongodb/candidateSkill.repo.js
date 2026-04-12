const CandidateSkillView = require('../../models/nosql/CandidateSkillView');
const createMongoRepo    = require('./_factory');
module.exports = createMongoRepo(CandidateSkillView);
