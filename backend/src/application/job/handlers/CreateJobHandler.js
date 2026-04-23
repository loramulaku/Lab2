const jobMysqlRepo    = require('../../../repositories/mysql/job.repo');
const { syncJobSafe } = require('../../../sync/jobSync');

class CreateJobHandler {
  async handle(command) {
    const job = await jobMysqlRepo.create(command);
    syncJobSafe(job.id);
    return job;
  }
}

module.exports = new CreateJobHandler();
