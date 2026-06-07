const PipelineNote  = require('../../../models/sql/PipelineNote');
const PipelineStage = require('../../../models/sql/PipelineStage');
const Application   = require('../../../models/sql/Application');
const CreateNotificationCommand = require('../../notification/commands/CreateNotification.command');
const createNotificationHandler = require('../../notification/handlers/CreateNotificationHandler');

class AddPipelineNoteHandler {
  async handle(command) {
    const note = await PipelineNote.create({
      applicationId: command.applicationId,
      stageId:       command.stageId,
      note:          command.note,
      createdBy:     command.recruiterId,
      createdAt:     new Date(),
    });

    const [stage, app] = await Promise.all([
      PipelineStage.findByPk(command.stageId),
      Application.findByPk(command.applicationId),
    ]);

    if (app) {
      createNotificationHandler.handle(new CreateNotificationCommand({
        userId:  app.userId,
        type:    'pipeline_note',
        message: `Recruiter note on your "${stage?.name ?? 'stage'}" stage: ${command.note}`,
        link:    '/my-profile?tab=applications',
      })).catch(() => {});
    }

    return note;
  }
}

module.exports = new AddPipelineNoteHandler();
