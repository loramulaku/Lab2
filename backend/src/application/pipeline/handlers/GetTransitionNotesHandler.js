const Pipeline        = require('../../../models/sql/Pipeline');
const PipelineStage   = require('../../../models/sql/PipelineStage');
const PipelineNote    = require('../../../models/sql/PipelineNote');
const ApplicationView = require('../../../models/nosql/ApplicationView');

class GetTransitionNotesHandler {
  async handle(query) {
    const pipeline = await Pipeline.findOne({ where: { companyId: query.companyId } });
    if (!pipeline) return [];

    const stages = await PipelineStage.findAll({
      where: { pipelineId: pipeline.id },
      order: [['order_index', 'ASC']],
    });
    const stageMap = Object.fromEntries(stages.map(s => [s.id, s.name]));

    const notes = await PipelineNote.findAll({ order: [['created_at', 'DESC']] });
    if (!notes.length) return [];

    const appIds = [...new Set(notes.map(n => n.applicationId))];
    const apps   = await ApplicationView.find({ _id: { $in: appIds } }).lean();
    const appMap = Object.fromEntries(apps.map(a => [String(a._id), a]));

    const result = {};
    for (const n of notes) {
      const app = appMap[String(n.applicationId)];
      if (!app) continue;

      const key = String(n.applicationId);
      if (!result[key]) {
        result[key] = {
          applicationId: n.applicationId,
          firstName:     app.applicantFirstName ?? null,
          lastName:      app.applicantLastName  ?? null,
          jobTitle:      app.jobTitle           ?? null,
          userId:        app.userId,
          notes:         [],
        };
      }
      result[key].notes.push({
        id:        n.id,
        note:      n.note,
        stageId:   n.stageId,
        stageName: stageMap[n.stageId] ?? 'Unknown Stage',
        createdAt: n.createdAt,
      });
    }

    return Object.values(result);
  }
}

module.exports = new GetTransitionNotesHandler();
