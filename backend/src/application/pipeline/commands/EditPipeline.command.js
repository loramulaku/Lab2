class EditPipelineCommand {
  constructor({ companyId, stages = [] }) {
    this.companyId = companyId;
    // stages: array of { name, hasCalendar }
    this.stages = stages;
  }
}
module.exports = EditPipelineCommand;
