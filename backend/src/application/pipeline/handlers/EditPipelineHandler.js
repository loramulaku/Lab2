const { Op }        = require('sequelize');
const Pipeline      = require('../../../models/sql/Pipeline');
const PipelineStage = require('../../../models/sql/PipelineStage');
const Application   = require('../../../models/sql/Application');
const { syncApplicationSafe } = require('../../../sync/applicationSync');

const normaliseStage = (s) =>
  typeof s === 'string'
    ? { name: s.trim(), hasCalendar: false }
    : { name: (s.name ?? '').trim(), hasCalendar: !!s.hasCalendar };

class EditPipelineHandler {
  async handle(command) {
    const pipeline = await Pipeline.findOne({ where: { companyId: command.companyId } });
    if (!pipeline) {
      const e = new Error('No pipeline found for this company');
      e.status = 404; throw e;
    }

    // Find all current stages (to know which applications need to be reset)
    const oldStages = await PipelineStage.findAll({ where: { pipelineId: pipeline.id } });
    const oldStageIds = oldStages.map(s => s.id);

    // Reset stageId on all applications that were in this pipeline
    let affectedIds = [];
    if (oldStageIds.length > 0) {
      const affected = await Application.findAll({
        where: { stageId: { [Op.in]: oldStageIds } },
        attributes: ['id'],
      });
      affectedIds = affected.map(a => a.id);
      await Application.update({ stageId: null }, { where: { stageId: { [Op.in]: oldStageIds } } });
    }

    // Delete old stages
    await PipelineStage.destroy({ where: { pipelineId: pipeline.id } });

    // Create new stages
    const customStages = command.stages.map(normaliseStage).filter(s => s.name);
    const allStages    = [{ name: 'Application', hasCalendar: false }, ...customStages];

    for (let i = 0; i < allStages.length; i++) {
      await PipelineStage.create({
        pipelineId:  pipeline.id,
        name:        allStages[i].name,
        orderIndex:  i,
        hasCalendar: allStages[i].hasCalendar,
      });
    }

    // Sync all affected applications to MongoDB (stageId → null)
    for (const id of affectedIds) {
      syncApplicationSafe(id);
    }

    const stages = await PipelineStage.findAll({
      where: { pipelineId: pipeline.id },
      order: [['order_index', 'ASC']],
    });

    return {
      ...pipeline.toJSON(),
      stages: stages.map(s => s.toJSON()),
      resetCount: affectedIds.length,
    };
  }
}

module.exports = new EditPipelineHandler();
