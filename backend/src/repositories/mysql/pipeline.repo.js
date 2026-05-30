const Pipeline = require('../../models/sql/Pipeline');
const PipelineStage = require('../../models/sql/PipelineStage');
const StageHistory = require('../../models/sql/StageHistory');
const Application = require('../../models/sql/Application');

class PipelineRepository {

  async createPipeline(jobId, name) {
    return await Pipeline.create({ jobId, name });
  }

  async getPipelineByJobId(jobId) {
    return await Pipeline.findOne({
      where: { jobId },
      include: [{ model: PipelineStage, as: 'stages', order: [['orderIndex', 'ASC']] }],
    });
  }

  async createStage(pipelineId, name, orderIndex) {
    return await PipelineStage.create({ pipelineId, name, orderIndex });
  }

  async getStagesByPipelineId(pipelineId) {
    return await PipelineStage.findAll({
      where: { pipelineId },
      order: [['orderIndex', 'ASC']],
    });
  }

  async moveCandidate(applicationId, fromStageId, toStageId, changedBy) {
    await Application.update(
      { status: 'in_pipeline' },
      { where: { id: applicationId } }
    );
    return await StageHistory.create({ applicationId, fromStageId, toStageId, changedBy });
  }

  async getStageHistory(applicationId) {
    return await StageHistory.findAll({
      where: { applicationId },
      include: [
        { model: PipelineStage, as: 'fromStage' },
        { model: PipelineStage, as: 'toStage' },
      ],
      order: [['createdAt', 'ASC']],
    });
  }

}

module.exports = new PipelineRepository();
