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
    if (!pipeline) { const e = new Error('No pipeline found for this company'); e.status = 404; throw e; }

    const sequelize = Pipeline.sequelize;

    return sequelize.transaction(async (t) => {
      const oldStages = await PipelineStage.findAll({ where: { pipelineId: pipeline.id }, transaction: t });
      const oldStageIds = oldStages.map(s => s.id);

      let affectedIds = [];
      if (oldStageIds.length > 0) {
        const affected = await Application.findAll({
          where: { stageId: { [Op.in]: oldStageIds } },
          attributes: ['id'],
          transaction: t,
        });
        affectedIds = affected.map(a => a.id);
        await Application.update({ stageId: null }, { where: { stageId: { [Op.in]: oldStageIds } }, transaction: t });
      }

      await PipelineStage.destroy({ where: { pipelineId: pipeline.id }, transaction: t });

      const customStages = command.stages.map(normaliseStage).filter(s => s.name);
      const allStages = [{ name: 'Application', hasCalendar: false }, ...customStages];

      for (let i = 0; i < allStages.length; i++) {
        await PipelineStage.create({
          pipelineId:  pipeline.id,
          name:        allStages[i].name,
          orderIndex:  i,
          hasCalendar: allStages[i].hasCalendar,
        }, { transaction: t });
      }

      const stages = await PipelineStage.findAll({
        where: { pipelineId: pipeline.id },
        order: [['order_index', 'ASC']],
        transaction: t,
      });

      // Sync after transaction commits (fire-and-forget, outside the transaction)
      for (const id of affectedIds) {
        syncApplicationSafe(id);
      }

      return {
        ...pipeline.toJSON(),
        stages: stages.map(s => s.toJSON()),
        resetCount: affectedIds.length,
      };
    });
  }
}

module.exports = new EditPipelineHandler();
