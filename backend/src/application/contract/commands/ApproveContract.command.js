class ApproveContractCommand {
  constructor({ contractId, userId }) {
    this.contractId = contractId;
    this.userId     = userId;
  }
}

module.exports = ApproveContractCommand;
