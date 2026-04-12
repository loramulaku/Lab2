const Skill           = require('../../models/sql/Skill');
const createMysqlRepo = require('./_factory');
module.exports = createMysqlRepo(Skill);
