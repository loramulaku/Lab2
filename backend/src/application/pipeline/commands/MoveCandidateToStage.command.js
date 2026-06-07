class MoveCandidateToStageCommand {
  constructor({ applicationId, toStageId, note, recruiterId, interviewDate }) {
    this.applicationId = applicationId;
    this.toStageId     = toStageId;
    this.note          = note || null;
    this.recruiterId   = recruiterId;
    this.interviewDate = interviewDate || null;
  }
}
module.exports = MoveCandidateToStageCommand;
