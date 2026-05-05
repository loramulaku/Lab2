const Application        = require('../models/sql/Application');
const Job                = require('../models/sql/Job');
const Company            = require('../models/sql/Company');
const User               = require('../models/sql/User');
const applicationViewRepo = require('../repositories/mongodb/applicationView.repo');

async function syncApplication(applicationId) {
  const app = await Application.findByPk(applicationId);
  if (!app) {
    await applicationViewRepo.delete(applicationId);
    return;
  }

  const job     = app.jobId     ? await Job.findByPk(app.jobId)         : null;
  const company = job?.companyId ? await Company.findByPk(job.companyId) : null;
  const user    = app.userId    ? await User.findByPk(app.userId)        : null;

  await applicationViewRepo.upsert({
    id:                 app.id,
    jobId:              app.jobId,
    userId:             app.userId,
    stageId:            app.stageId,
    currentStage:       app.currentStage,
    status:             app.status,
    coverLetter:        app.coverLetter,
    appliedAt:          app.appliedAt,
    jobTitle:           job?.title      ?? null,
    companyName:        company?.name   ?? null,
    applicantFirstName: user?.firstName ?? null,
    applicantLastName:  user?.lastName  ?? null,
    applicantEmail:     user?.email     ?? null,
  });
}

function syncApplicationSafe(applicationId) {
  syncApplication(applicationId).catch(err =>
    console.error(`[applicationSync] Failed to sync applicationId=${applicationId}:`, err.message)
  );
}

module.exports = { syncApplication, syncApplicationSafe };
