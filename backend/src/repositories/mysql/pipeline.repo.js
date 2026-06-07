const Pipeline        = require('../../models/sql/Pipeline');
const PipelineStage   = require('../../models/sql/PipelineStage');
const Application     = require('../../models/sql/Application');
const createMysqlRepo = require('./_factory');

module.exports = {
  ...createMysqlRepo(Pipeline),

  async getPipelineByCompanyId(companyId) {
    const pipeline = await Pipeline.findOne({ where: { companyId: Number(companyId) } });
    if (!pipeline) return null;
    const stages = await PipelineStage.findAll({
      where: { pipelineId: pipeline.id },
      order: [['order_index', 'ASC']],
    });
    return { ...pipeline.toJSON(), stages: stages.map(s => s.toJSON()) };
  },

  async getPipelineByJobId(jobId) {
    const pipeline = await Pipeline.findOne({ where: { jobId: Number(jobId) } });
    if (!pipeline) return null;
    const stages = await PipelineStage.findAll({
      where: { pipelineId: pipeline.id },
      order: [['order_index', 'ASC']],
    });
    return { ...pipeline.toJSON(), stages: stages.map(s => s.toJSON()) };
  },

  async createStage(pipelineId, name, orderIndex) {
    return PipelineStage.create({ pipelineId, name, orderIndex });
  },

  async moveCandidate(applicationId, fromStageId, toStageId) {
    await Application.update({ stageId: toStageId }, { where: { id: applicationId } });
    return { applicationId, fromStageId, toStageId, movedAt: new Date() };
  },

  async getStageHistory() {
    return [];
  },
};
