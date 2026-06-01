class SubmitBidCommand {
  constructor(data) {
    this.jobId            = data.jobId;
    this.freelancerId     = data.freelancerId;
    this.price            = data.price;
    this.deliveryTimeDays = data.deliveryTimeDays;
    this.message          = data.message;
    this.coverLetter      = data.coverLetter;
  }
}
module.exports = SubmitBidCommand;
