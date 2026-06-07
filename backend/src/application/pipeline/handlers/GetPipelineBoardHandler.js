const Pipeline        = require('../../../models/sql/Pipeline');
const PipelineStage   = require('../../../models/sql/PipelineStage');
const ApplicationView = require('../../../models/nosql/ApplicationView');

class GetPipelineBoardHandler {
  async handle(query) {
    const pipeline = await Pipeline.findOne({ where: { companyId: query.companyId } });
    if (!pipeline) return null;

    const stages = await PipelineStage.findAll({
      where: { pipelineId: pipeline.id },
      order: [['order_index', 'ASC']],
    });

    let applications = await ApplicationView.find({ companyId: Number(query.companyId) }).lean();

    if (query.search) {
      const s = query.search.toLowerCase();
      applications = applications.filter(a =>
        `${a.applicantFirstName ?? ''} ${a.applicantLastName ?? ''}`.toLowerCase().includes(s)
      );
    }

    // Build stage columns, each with their candidates
    const stageMap = {};
    for (const stage of stages) {
      stageMap[stage.id] = { ...stage.toJSON(), candidates: [] };
    }

    const firstStageId = stages[0]?.id ?? null;

    for (const app of applications) {
      const card = {
        applicationId: app._id,
        firstName:     app.applicantFirstName ?? null,
        lastName:      app.applicantLastName  ?? null,
        phone:         app.phone              ?? null,
        jobTitle:      app.jobTitle           ?? null,
        userId:        app.userId,
        status:        app.status,
        stageId:       app.stageId            ?? null,
      };

      const targetStage = app.stageId && stageMap[app.stageId]
        ? app.stageId
        : firstStageId;

      if (targetStage && stageMap[targetStage]) {
        stageMap[targetStage].candidates.push(card);
      }
    }

    return {
      pipeline: pipeline.toJSON(),
      stages:   stages.map(s => stageMap[s.id]),
    };
  }
}

module.exports = new GetPipelineBoardHandler();
