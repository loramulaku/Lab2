const Application = require('../../../models/sql/Application');
const Job         = require('../../../models/sql/Job');
const { syncApplicationSafe } = require('../../../sync/applicationSync');

class RejectApplicationHandler {
  async handle(command) {
    const app = await Application.findByPk(command.applicationId);
    if (!app) {
      const e = new Error('Application not found'); e.status = 404; throw e;
    }
    const job = await Job.findByPk(app.jobId);
    if (!job || job.companyId !== command.companyId) {
      const e = new Error('Forbidden'); e.status = 403; throw e;
    }
    if (app.status === 'hired') {
      const e = new Error('Cannot reject an already hired candidate'); e.status = 409; throw e;
    }

    await app.update({ status: 'rejected' });
    syncApplicationSafe(app.id);
    return { applicationId: app.id, status: 'rejected' };
  }
}

module.exports = new RejectApplicationHandler();
