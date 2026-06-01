class SendInvitationCommand {
  constructor(data) {
    this.companyId        = data.companyId;
    this.freelancerId     = data.freelancerId;
    this.jobId            = data.jobId;
    this.title            = data.title;
    this.message          = data.message;
    this.priceOffer       = data.priceOffer;
    this.deliveryTimeDays = data.deliveryTimeDays;
    this.expiresAt        = data.expiresAt;
  }
}
module.exports = SendInvitationCommand;
