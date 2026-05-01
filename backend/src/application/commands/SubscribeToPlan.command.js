class SubscribeToPlanCommand {
  /**
   * @param {object} data
   * @param {number} data.companyId - resolved from recruiter profile, not request body
   * @param {number} data.planId
   */
  constructor(data) {
    this.companyId = data.companyId;
    this.planId    = data.planId;
  }
}

module.exports = SubscribeToPlanCommand;
