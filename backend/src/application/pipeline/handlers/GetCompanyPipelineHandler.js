const Pipeline      = require('../../../models/sql/Pipeline');
const PipelineStage = require('../../../models/sql/PipelineStage');

class GetCompanyPipelineHandler {
  async handle(query) {
    const pipeline = await Pipeline.findOne({ where: { companyId: query.companyId } });
    if (!pipeline) return null;
    const stages = await PipelineStage.findAll({
      where: { pipelineId: pipeline.id },
      order: [['order_index', 'ASC']],
    });
    return { ...pipeline.toJSON(), stages: stages.map(s => s.toJSON()) };
  }
}

module.exports = new GetCompanyPipelineHandler();
