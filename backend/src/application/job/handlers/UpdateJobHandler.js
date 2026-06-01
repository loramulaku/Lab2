const jobMysqlRepo    = require('../../../repositories/mysql/job.repo');
const JobSkill        = require('../../../models/sql/JobSkill');
const JobCategory     = require('../../../models/sql/JobCategory');
const Bid             = require('../../../models/sql/Bid');
const { bidsAllowed } = require('../../_shared/jobModePolicy');
const { httpError }   = require('../../_shared/ContractService');
const { syncJobSafe } = require('../../../sync/jobSync');

class UpdateJobHandler {
  async handle(command) {
    const { jobId, skillIds, categoryIds, ...fields } = command;

    // Only pass defined scalar fields to the SQL update
    const coreData = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );

    // Edge case #2 — don't strand existing bids by changing the job's type/mode.
    // Widening (e.g. public → both) is fine; narrowing away from a public board
    // while pending bids exist is rejected.
    if (coreData.employmentType !== undefined || coreData.jobMode !== undefined) {
      const existing = await jobMysqlRepo.findById(jobId);
      if (!existing) return null;

      const wasBiddable = bidsAllowed(existing);
      const willBeBiddable = bidsAllowed({
        employmentType: coreData.employmentType ?? existing.employmentType,
        jobMode:        coreData.jobMode        ?? existing.jobMode,
      });

      if (wasBiddable && !willBeBiddable) {
        const pending = await Bid.count({ where: { jobId, status: 'pending' } });
        if (pending > 0) {
          throw httpError(409, 'Cannot change job type/mode while pending bids exist', 'HAS_ACTIVE_BIDS');
        }
      }
    }

    // Only hit the DB with an UPDATE when there are actual scalar fields to change.
    // When only skillIds/categoryIds are provided, coreData is empty and
    // Job.update({}, ...) returns 0 affected rows — so skip straight to findById.
    let job;
    if (Object.keys(coreData).length > 0) {
      job = await jobMysqlRepo.update(jobId, coreData);
      if (!job) return null;
    } else {
      job = await jobMysqlRepo.findById(jobId);
      if (!job) return null;
    }

    // Replace skill associations when skillIds is explicitly provided
    if (skillIds !== undefined) {
      await JobSkill.destroy({ where: { jobId } });
      if (skillIds.length) {
        await JobSkill.bulkCreate(skillIds.map(skillId => ({ jobId, skillId })));
      }
    }

    // Replace category associations when categoryIds is explicitly provided
    if (categoryIds !== undefined) {
      await JobCategory.destroy({ where: { jobId } });
      if (categoryIds.length) {
        await JobCategory.bulkCreate(categoryIds.map(categoryId => ({ jobId, categoryId })));
      }
    }

    syncJobSafe(jobId);
    return job;
  }
}

module.exports = new UpdateJobHandler();
