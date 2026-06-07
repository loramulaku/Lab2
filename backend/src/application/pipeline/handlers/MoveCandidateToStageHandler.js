const Application   = require('../../../models/sql/Application');
const PipelineStage = require('../../../models/sql/PipelineStage');
const PipelineNote  = require('../../../models/sql/PipelineNote');
const { syncApplicationSafe }    = require('../../../sync/applicationSync');
const CreateNotificationCommand  = require('../../notification/commands/CreateNotification.command');
const createNotificationHandler  = require('../../notification/handlers/CreateNotificationHandler');

class MoveCandidateToStageHandler {
  async handle(command) {
    if (!command.note || !command.note.trim()) {
      const e = new Error('A transition note is required when moving a candidate to a new stage');
      e.status = 400; e.code = 'NOTE_REQUIRED'; throw e;
    }

    const app = await Application.findByPk(command.applicationId);
    if (!app) { const e = new Error('Application not found'); e.status = 404; throw e; }

    const stage = await PipelineStage.findByPk(command.toStageId);
    if (!stage) { const e = new Error('Stage not found'); e.status = 404; throw e; }

    const updatePayload = { stageId: command.toStageId };
    if (command.interviewDate) updatePayload.interviewAt = new Date(command.interviewDate);

    await app.update(updatePayload);

    await PipelineNote.create({
      applicationId: command.applicationId,
      stageId:       command.toStageId,
      note:          command.note.trim(),
      createdBy:     command.recruiterId,
      createdAt:     new Date(),
    });

    syncApplicationSafe(app.id);

    let msg = `Your application has been moved to "${stage.name}": ${command.note.trim()}`;
    if (command.interviewDate) {
      const dateStr = new Date(command.interviewDate).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      msg += ` — Interview/meeting scheduled for ${dateStr}.`;
    }

    createNotificationHandler.handle(new CreateNotificationCommand({
      userId:  app.userId,
      type:    'pipeline_stage_change',
      message: msg,
      link:    '/my-profile?tab=applications',
    })).catch(() => {});

    return {
      applicationId: app.id,
      toStageId:     command.toStageId,
      stageName:     stage.name,
      interviewAt:   updatePayload.interviewAt ?? null,
    };
  }
}

module.exports = new MoveCandidateToStageHandler();
