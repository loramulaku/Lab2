const jobMysqlRepo          = require('../../../repositories/mysql/job.repo');
const subscriptionMysqlRepo = require('../../../repositories/mysql/subscription.repo');
const Job                   = require('../../../models/sql/Job');
const { syncJobSafe }       = require('../../../sync/jobSync');

const VALID_JOB_MODES = ['public', 'invite', 'both'];

class CreateJobHandler {
  async handle(command) {
    // A freelance job must declare a mode (A/B/C); a non-freelance job must not.
    if (command.employmentType === 'freelance') {
      if (!VALID_JOB_MODES.includes(command.jobMode)) {
        const err = new Error('Freelance jobs require jobMode to be public, invite, or both');
        err.status = 400;
        throw err;
      }
    } else {
      command.jobMode = null;
    }

    const sub = await subscriptionMysqlRepo.findActiveByCompanyId(command.companyId);

    if (!sub) {
      const err = new Error('You need a subscription to post a job');
      err.status = 403;
      throw err;
    }

    const plan = sub.Plan;
    if (plan && plan.jobLimit !== null) {
      const jobCount = await Job.count({
        where: { companyId: command.companyId, status: 'open' },
      });
      if (jobCount >= plan.jobLimit) {
        const err = new Error(`You have reached your job posting limit for the ${plan.name} plan`);
        err.status = 403;
        throw err;
      }
    }

    const job = await jobMysqlRepo.create(command);
    syncJobSafe(job.id);
    return job;
  }
}

module.exports = new CreateJobHandler();
