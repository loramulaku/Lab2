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

    // "Application" is always the mandatory first stage (no calendar, locked)
    // Then recruiter's custom stages follow.
    // Each stage may be a string (legacy) or { name, hasCalendar }
    const normalise = (s) =>
      typeof s === 'string' ? { name: s.trim(), hasCalendar: false } : { name: (s.name ?? '').trim(), hasCalendar: !!s.hasCalendar };

    const customStages = command.stages
      .map(normalise)
      .filter(s => s.name);

    const allStages = [
      { name: 'Application', hasCalendar: false },
      ...customStages,
    ];

    for (let i = 0; i < allStages.length; i++) {
      await PipelineStage.create({
        pipelineId:  pipeline.id,
        name:        allStages[i].name,
        orderIndex:  i,
        hasCalendar: allStages[i].hasCalendar,
      });
    }

    const stages = await PipelineStage.findAll({
      where: { pipelineId: pipeline.id },
      order: [['order_index', 'ASC']],
    });

    return { ...pipeline.toJSON(), stages: stages.map(s => s.toJSON()) };
  }
}

module.exports = new CreatePipelineHandler();
