const PipelineView    = require('../../models/nosql/PipelineView');
const createMongoRepo = require('./_factory');
module.exports = createMongoRepo(PipelineView);
