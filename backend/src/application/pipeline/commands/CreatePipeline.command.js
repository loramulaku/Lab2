class CreatePipelineCommand {
  constructor({ companyId, stages = [] }) {
    this.companyId = companyId;
    // stages: array of { name, hasCalendar } objects (or bare strings for backward compat)
    this.stages = stages;
  }
}
module.exports = CreatePipelineCommand;
