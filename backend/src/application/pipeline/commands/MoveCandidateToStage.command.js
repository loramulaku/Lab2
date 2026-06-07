class MoveCandidateToStageCommand {
  constructor({ applicationId, toStageId, note, recruiterId }) {
    this.applicationId = applicationId;
    this.toStageId     = toStageId;
    this.note          = note || null;
    this.recruiterId   = recruiterId;
  }
}
module.exports = MoveCandidateToStageCommand;
