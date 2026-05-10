class SubscribeToPlanCommand {
  /**
   * @param {object} data
   * @param {number} data.companyId - resolved from recruiter profile, not request body
   * @param {number} data.planId
   * @param {number} data.userId - recruiter user ID for Stripe customer
   */
  constructor(data) {
    this.companyId = data.companyId;
    this.planId    = data.planId;
    this.userId    = data.userId;
  }
}

module.exports = SubscribeToPlanCommand;
