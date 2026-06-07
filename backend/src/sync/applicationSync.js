/**
 * applicationSync — CQRS read-side projection for Applications (standard-employment
 * "apply" flow). Called after every MySQL write to an Application. Denormalises
 * the job, owning company, and applicant so recruiter/candidate reads never join.
 *
 * Flow:
 *   MySQL write (Application)
 *     └─► syncApplication(applicationId)
 *           ├─ SELECT Application + Job + Company + User  (MySQL)
 *           └─ ApplicationView.upsert({ _id: applicationId, ... })  (MongoDB)
 */
const Application = require('../models/sql/Application');
const Job         = require('../models/sql/Job');
const Company     = require('../models/sql/Company');
const User        = require('../models/sql/User');
const FailedSync  = require('../models/sql/FailedSync');
const applicationRepo = require('../repositories/mongodb/application.repo');
const JobView     = require('../models/nosql/JobView');

async function syncApplication(applicationId) {
  const app = await Application.findByPk(applicationId);
  if (!app) {
    await applicationRepo.delete(applicationId);
    return;
  }

  const [job, user] = await Promise.all([
    app.jobId ? Job.findByPk(app.jobId) : null,
    app.userId ? User.findByPk(app.userId) : null,
  ]);
  const company = job?.companyId ? await Company.findByPk(job.companyId) : null;

  await applicationRepo.upsert({
    id:                 app.id,
    jobId:              app.jobId,
    userId:             app.userId,
    stageId:            app.stageId ?? null,
    status:             app.status,
    appliedAt:          app.appliedAt,
    interviewAt:        app.interviewAt ?? null,
    coverLetter:        app.coverLetter ?? null,
    expectedSalary:     app.expectedSalary != null ? Number(app.expectedSalary) : null,
    availableFrom:      app.availableFrom ?? null,
    cvPath:             app.cvPath ?? null,
    phone:              app.phone ?? null,
    willingToRelocate:  app.willingToRelocate ?? null,
    yearsExperience:    app.yearsExperience ?? null,
    screeningAnswers:   app.screeningAnswers ?? null,
    skillsSnapshot:     app.skillsSnapshot ?? null,
    companyId:          job?.companyId ?? null,
    jobTitle:           job?.title ?? null,
    jobEmploymentType:  job?.employmentType ?? null,
    companyName:        company?.name ?? null,
    applicantFirstName: user?.firstName ?? null,
    applicantLastName:  user?.lastName ?? null,
    applicantEmail:     user?.email ?? null,
  });

  if (app.jobId) {
    const count = await Application.count({ where: { jobId: app.jobId } });
    await JobView.updateOne({ _id: app.jobId }, { $set: { applicationCount: count } });
  }

  await FailedSync.destroy({ where: { entityType: 'application', entityId: applicationId } });
}

function syncApplicationSafe(applicationId) {
  syncApplication(applicationId).catch(async (err) => {
    console.error(`[applicationSync] Failed to sync applicationId=${applicationId}:`, err.message);
    try {
      const [record, created] = await FailedSync.findOrCreate({
        where: { entityType: 'application', entityId: applicationId },
        defaults: {
          entityType: 'application', entityId: applicationId,
          errorMessage: err.message, attempts: 1,
          lastAttemptedAt: new Date(), createdAt: new Date(),
        },
      });
      if (!created) {
        await record.update({ errorMessage: err.message, attempts: record.attempts + 1, lastAttemptedAt: new Date(), resolvedAt: null });
      }
    } catch (dbErr) {
      console.error('[applicationSync] Could not write to FailedSyncs:', dbErr.message);
    }
  });
}

module.exports = { syncApplication, syncApplicationSafe };
