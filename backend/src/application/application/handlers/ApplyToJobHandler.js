const Application = require('../../../models/sql/Application');
const Job         = require('../../../models/sql/Job');
const { syncApplicationSafe } = require('../../../sync/applicationSync');

/**
 * Candidate applies to a STANDARD-employment job.
 * Freelance jobs use the bid/invite flow instead, so they are rejected here.
 * Duplicate applications are blocked by the UNIQUE(job_id, user_id) constraint.
 */
class ApplyToJobHandler {
  async handle(command) {
    const job = await Job.findByPk(command.jobId);
    if (!job) { const e = new Error('Job not found'); e.status = 404; throw e; }

    if (job.employmentType === 'freelance') {
      const e = new Error('Freelance jobs use bids or invitations, not applications');
      e.status = 400; throw e;
    }
    if (job.status !== 'open') {
      const e = new Error('This job is not open for applications'); e.status = 409; throw e;
    }

    const existing = await Application.findOne({ where: { jobId: command.jobId, userId: command.userId } });
    if (existing) {
      const e = new Error('You have already applied to this job'); e.status = 409; throw e;
    }

    let app;
    try {
      app = await Application.create({
        jobId: command.jobId,
        userId: command.userId,
        status: 'pending',
        appliedAt: new Date(),
      });
    } catch (err) {
      // Race: unique constraint caught the duplicate between check and insert.
      if (err?.name === 'SequelizeUniqueConstraintError') {
        const e = new Error('You have already applied to this job'); e.status = 409; throw e;
      }
      throw err;
    }

    syncApplicationSafe(app.id);
    return { id: app.id, jobId: app.jobId, status: app.status, message: 'Application submitted' };
  }
}

module.exports = new ApplyToJobHandler();
