const Pipeline      = require('../../../models/sql/Pipeline');
const PipelineStage = require('../../../models/sql/PipelineStage');

class CreatePipelineHandler {
  async handle(command) {
    const existing = await Pipeline.findOne({ where: { companyId: command.companyId } });
    if (existing) {
      const e = new Error('A pipeline already exists for this company');
      e.status = 409; e.code = 'PIPELINE_EXISTS'; throw e;
    }

    const pipeline = await Pipeline.create({
      companyId: command.companyId,
      name:      'Recruitment Pipeline',
    });

    // "Application" is always the mandatory first stage; recruiter's stages follow.
    const allStageNames = ['Application', ...command.stages.filter(s => s.trim())];
    for (let i = 0; i < allStageNames.length; i++) {
      await PipelineStage.create({ pipelineId: pipeline.id, name: allStageNames[i], orderIndex: i });
    }

    const stages = await PipelineStage.findAll({
      where: { pipelineId: pipeline.id },
      order: [['order_index', 'ASC']],
    });

    return { ...pipeline.toJSON(), stages: stages.map(s => s.toJSON()) };
  }
}

module.exports = new CreatePipelineHandler();
