class AddPipelineNoteCommand {
  constructor({ applicationId, stageId, note, recruiterId }) {
    this.applicationId = applicationId;
    this.stageId       = stageId;
    this.note          = note;
    this.recruiterId   = recruiterId;
  }
}
module.exports = AddPipelineNoteCommand;
