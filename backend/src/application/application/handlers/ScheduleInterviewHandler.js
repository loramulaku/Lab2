const Application = require('../../../models/sql/Application');
const Job         = require('../../../models/sql/Job');
const { syncApplicationSafe } = require('../../../sync/applicationSync');

/**
 * Recruiter schedules an interview for one of their company's applicants.
 * Verifies the application belongs to a job owned by the recruiter's company.
 */
class ScheduleInterviewHandler {
  async handle(command) {
    const app = await Application.findByPk(command.applicationId);
    if (!app) { const e = new Error('Application not found'); e.status = 404; throw e; }

    const job = await Job.findByPk(app.jobId);
    if (!job || (command.companyId && job.companyId !== command.companyId)) {
      const e = new Error('You can only schedule interviews for your own jobs'); e.status = 403; throw e;
    }

    await app.update({ status: 'interview', interviewAt: command.interviewAt ? new Date(command.interviewAt) : new Date() });
    syncApplicationSafe(app.id);
    return { id: app.id, status: app.status, interviewAt: app.interviewAt, message: 'Interview scheduled' };
  }
}

module.exports = new ScheduleInterviewHandler();
