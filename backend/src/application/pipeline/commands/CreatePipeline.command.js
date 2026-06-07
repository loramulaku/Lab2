class CreatePipelineCommand {
  constructor({ companyId, stages = [] }) {
    this.companyId = companyId;
    this.stages    = stages; // array of stage names (recruiter's custom stages; "Application" is always prepended)
  }
}
module.exports = CreatePipelineCommand;
