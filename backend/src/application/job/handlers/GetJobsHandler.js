const jobViewRepo = require('../../../repositories/mongodb/jobView.repo');

class GetJobsHandler {
  async handle(query) {
    return jobViewRepo.findAll(query);
  }
}

module.exports = new GetJobsHandler();
