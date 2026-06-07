const Application   = require('../../../models/sql/Application');
const PipelineStage = require('../../../models/sql/PipelineStage');
const PipelineNote  = require('../../../models/sql/PipelineNote');
const { syncApplicationSafe }    = require('../../../sync/applicationSync');
const CreateNotificationCommand  = require('../../notification/commands/CreateNotification.command');
const createNotificationHandler  = require('../../notification/handlers/CreateNotificationHandler');

class MoveCandidateToStageHandler {
  async handle(command) {
    const app = await Application.findByPk(command.applicationId);
    if (!app) { const e = new Error('Application not found'); e.status = 404; throw e; }

    const stage = await PipelineStage.findByPk(command.toStageId);
    if (!stage) { const e = new Error('Stage not found'); e.status = 404; throw e; }

    await app.update({ stageId: command.toStageId });

    if (command.note) {
      await PipelineNote.create({
        applicationId: command.applicationId,
        stageId:       command.toStageId,
        note:          command.note,
        createdBy:     command.recruiterId,
        createdAt:     new Date(),
      });
    }

    syncApplicationSafe(app.id);

    // Notify candidate in real-time
    const msg = command.note
      ? `Your application has been moved to "${stage.name}": ${command.note}`
      : `Your application has been moved to "${stage.name}".`;

    createNotificationHandler.handle(new CreateNotificationCommand({
      userId:  app.userId,
      type:    'pipeline_stage_change',
      message: msg,
      link:    '/my-profile?tab=applications',
    })).catch(() => {});

    return { applicationId: app.id, toStageId: command.toStageId, stageName: stage.name };
  }
}

module.exports = new MoveCandidateToStageHandler();
