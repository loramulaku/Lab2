class CreateCheckoutSessionCommand {
  constructor(data) {
    this.companyId   = Number(data.companyId);
    this.planId      = Number(data.planId);
    this.userEmail   = data.userEmail;
    this.companyName = data.companyName;
    this.origin      = data.origin ?? null;
  }
}
module.exports = CreateCheckoutSessionCommand;
