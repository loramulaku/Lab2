const jobMysqlRepo         = require('../../repositories/mysql/job.repo');
const applicationRepo      = require('../../repositories/mysql/application.repo');
const { syncApplicationSafe } = require('../../sync/applicationSync');

class ApplyToJobHandler {
  async handle(command) {
    const job = await jobMysqlRepo.findById(command.jobId);
    if (!job) {
      const err = new Error('Job not found'); err.status = 404; throw err;
    }
    if (job.status !== 'open') {
      const err = new Error('This job is no longer accepting applications'); err.status = 400; throw err;
    }
    if (job.employmentType !== 'full-time') {
      const err = new Error('Use bids to apply to freelance jobs'); err.status = 400; throw err;
    }

    const duplicate = await applicationRepo.findByJobAndUser(command.jobId, command.userId);
    if (duplicate) {
      const err = new Error('You have already applied to this job'); err.status = 409; throw err;
    }

    const application = await applicationRepo.create({
      jobId:        command.jobId,
      userId:       command.userId,
      coverLetter:  command.coverLetter,
      currentStage: 'applied',
      status:       'active',
      appliedAt:    new Date(),
    });

    syncApplicationSafe(application.id);
    return application;
  }
}

module.exports = new ApplyToJobHandler();
