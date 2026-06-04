class ConfirmCheckoutSessionCommand {
  constructor(data) {
    this.companyId = Number(data.companyId);
    this.sessionId = data.sessionId;
  }
}

module.exports = ConfirmCheckoutSessionCommand;
