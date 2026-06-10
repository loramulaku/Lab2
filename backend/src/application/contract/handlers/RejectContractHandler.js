const Contract = require('../../../models/sql/Contract');
const { httpError } = require('../../_shared/ContractService');
const { syncContractSafe } = require('../../../sync/contractSync');

class RejectContractHandler {
  async handle(command) {
    const contract = await Contract.findByPk(command.contractId);
    if (!contract) throw httpError(404, 'Contract not found', 'CONTRACT_NOT_FOUND');
    if (contract.status !== 'pending') {
      throw httpError(409, `Contract is already ${contract.status}`, 'CONTRACT_NOT_PENDING');
    }
    if (contract.freelancerId !== command.userId) {
      throw httpError(403, 'You are not a party to this contract', 'FORBIDDEN');
    }
    await contract.update({ status: 'rejected' });
    syncContractSafe(contract.id);
    return contract;
  }
}

module.exports = new RejectContractHandler();
