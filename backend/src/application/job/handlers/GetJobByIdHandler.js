const jobViewRepo = require('../../../repositories/mongodb/jobView.repo');

class GetJobByIdHandler {
  async handle(query) {
    return jobViewRepo.findByJobId(query.jobId);
  }
}

module.exports = new GetJobByIdHandler();
