const jobMysqlRepo          = require('../../../repositories/mysql/job.repo');
const subscriptionMysqlRepo = require('../../../repositories/mysql/subscription.repo');
const JobCategory           = require('../../../models/sql/JobCategory');
const Job                   = require('../../../models/sql/Job');
const Plan                  = require('../../../models/sql/Plan');
const { syncJobSafe }       = require('../../../sync/jobSync');

async function findNextPlanUp(currentPlanId, currentLimit) {
  if (currentLimit === null) return null; // already unlimited — no upgrade exists
  const plans = await Plan.findAll({ where: { isActive: true } });
  plans.sort((a, b) => {
    if (a.jobLimit === null) return 1;
    if (b.jobLimit === null) return -1;
    return a.jobLimit - b.jobLimit;
  });
  const next = plans.find(p =>
    p.id !== currentPlanId &&
    (p.jobLimit === null || Number(p.jobLimit) > Number(currentLimit))
  );
  if (!next) return null;
  return {
    id:              next.id,
    name:            next.name,
    jobLimit:        next.jobLimit !== null ? Number(next.jobLimit) : null,
    price:           next.price ? Number(next.price) : null,
    billingInterval: next.billingInterval,
  };
}

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
        const suggestedPlan = await findNextPlanUp(plan.id, plan.jobLimit);
        const err = new Error(`You have reached your job posting limit for the ${plan.name} plan`);
        err.status = 403;
        err.code   = 'JOB_LIMIT_REACHED';
        if (suggestedPlan) err.suggestedPlan = suggestedPlan;
        throw err;
      }
    }

    // Destructure category before passing to the SQL model
    const { categoryId, invitees, ...jobData } = command;

    const job = await jobMysqlRepo.create(jobData);

    // Save category association if provided
    if (categoryId) {
      await JobCategory.create({ jobId: job.id, categoryId: Number(categoryId) });
    }

    syncJobSafe(job.id);
    return job;
  }
}

module.exports = new CreateJobHandler();
