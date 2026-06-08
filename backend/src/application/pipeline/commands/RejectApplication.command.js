class RejectApplicationCommand {
  constructor({ applicationId, companyId }) {
    this.applicationId = applicationId;
    this.companyId     = companyId;
  }
}

module.exports = RejectApplicationCommand;
