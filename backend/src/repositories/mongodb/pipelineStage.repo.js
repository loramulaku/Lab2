const PipelineStageView = require('../../models/nosql/PipelineStageView');
const createMongoRepo   = require('./_factory');
module.exports = createMongoRepo(PipelineStageView);
