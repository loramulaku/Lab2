const jobMysqlRepo    = require('../../../repositories/mysql/job.repo');
const Contract        = require('../../../models/sql/Contract');
const { httpError }   = require('../../_shared/ContractService');
const { syncJobSafe } = require('../../../sync/jobSync');

const VALID_STATUSES = ['open', 'closed', 'archived'];

class UpdateJobStatusHandler {
  async handle(command) {
    const { jobId, status } = command;

    if (!VALID_STATUSES.includes(status)) {
      const err = new Error('status must be open, closed, or archived');
      err.status = 400;
      throw err;
    }

    const existing = await jobMysqlRepo.findById(jobId);
    if (!existing) return null;

    if (existing.status === 'archived') {
      throw httpError(409, 'Archived jobs cannot change status', 'JOB_ARCHIVED');
    }

    // Reopening a closed job is only allowed if there is no active contract.
    if (status === 'open' && existing.status === 'closed') {
      const active = await Contract.count({ where: { jobId, status: 'active' } });
      if (active > 0) {
        throw httpError(409, 'Cannot reopen a job with an active contract', 'HAS_ACTIVE_CONTRACT');
      }
    }

    const patch = { status, updatedAt: new Date() };
    if (status === 'closed')   patch.closedAt = new Date();
    if (status === 'archived') patch.archivedAt = new Date();

    const job = await jobMysqlRepo.update(jobId, patch);
    syncJobSafe(jobId);
    return job;
  }
}

module.exports = new UpdateJobStatusHandler();
