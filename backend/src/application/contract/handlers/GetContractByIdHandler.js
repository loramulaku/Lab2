const contractViewRepo = require('../../../repositories/mongodb/contract.repo');

class GetContractByIdHandler {
  async handle(query) {
    return contractViewRepo.findById(Number(query.contractId));
  }
}

module.exports = new GetContractByIdHandler();
