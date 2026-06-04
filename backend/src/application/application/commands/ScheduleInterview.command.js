class ScheduleInterviewCommand {
  constructor({ applicationId, companyId, interviewAt }) {
    this.applicationId = Number(applicationId);
    this.companyId     = companyId;
    this.interviewAt   = interviewAt;
  }
}
module.exports = ScheduleInterviewCommand;
