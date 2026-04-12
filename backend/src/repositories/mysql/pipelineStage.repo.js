const PipelineStage   = require('../../models/sql/PipelineStage');
const createMysqlRepo = require('./_factory');
module.exports = createMysqlRepo(PipelineStage);
