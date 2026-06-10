class RejectContractCommand {
  constructor({ contractId, userId }) {
    this.contractId = contractId;
    this.userId     = userId;
  }
}

module.exports = RejectContractCommand;
