const Application      = require('../../../models/sql/Application');
const Job              = require('../../../models/sql/Job');
const Pipeline         = require('../../../models/sql/Pipeline');
const PipelineStage    = require('../../../models/sql/PipelineStage');
const CandidateProfile = require('../../../models/sql/CandidateProfile');
const { syncApplicationSafe } = require('../../../sync/applicationSync');
const { syncCandidateSafe }   = require('../../../sync/candidateSync');
const CreateNotificationCommand = require('../../notification/commands/CreateNotification.command');
const createNotificationHandler = require('../../notification/handlers/CreateNotificationHandler');

/**
 * Candidate applies to a STANDARD-employment job. The application enters the
 * hiring pipeline at the first ("CV") stage. A CV is required — taken from the
 * command or, failing that, the candidate's stored profile CV. Reusable contact
 * details/links are saved back to the profile so they prefill next time.
 *
 * Freelance jobs use the bid/invite flow and are rejected here.
 * Duplicates are blocked by the explicit check + the UNIQUE(job_id, user_id) key.
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

    // CV is required and feeds the pipeline. Prefer the freshly-provided one,
    // otherwise reuse the CV already stored on the profile.
    const profile = await CandidateProfile.findOne({ where: { userId: command.userId } });
    const cvPath  = command.cvPath || profile?.cvPath || null;
    if (!cvPath) {
      const e = new Error('A CV/resume is required to apply'); e.status = 400; throw e;
    }

    // Place at the first stage of the company's pipeline automatically.
    let stageId = null;
    const pipeline = await Pipeline.findOne({ where: { companyId: job.companyId } });
    if (pipeline) {
      const firstStage = await PipelineStage.findOne({
        where: { pipelineId: pipeline.id },
        order: [['order_index', 'ASC']],
      });
      stageId = firstStage?.id ?? null;
    }

    let app;
    try {
      app = await Application.create({
        jobId:             command.jobId,
        userId:            command.userId,
        stageId,
        status:            'pending',          // recruiter pipeline status; shown to candidate as "In review"
        appliedAt:         new Date(),
        coverLetter:       command.coverLetter,
        expectedSalary:    command.expectedSalary,
        availableFrom:     command.availableFrom,
        cvPath,
        phone:             command.phone,
        willingToRelocate: command.willingToRelocate,
        yearsExperience:   command.yearsExperience,
        screeningAnswers:  command.screeningAnswers,
        skillsSnapshot:    command.skillsSnapshot,
      });
    } catch (err) {
      if (err?.name === 'SequelizeUniqueConstraintError') {
        const e = new Error('You have already applied to this job'); e.status = 409; throw e;
      }
      throw err;
    }

    // Save reusable contact/links back to the profile (only non-null values) so
    // the candidate never re-types them on the next application.
    const back = {};
    if (command.location          != null) back.location          = command.location;
    if (command.phone             != null) back.phone             = command.phone;
    if (command.willingToRelocate != null) back.willingToRelocate = command.willingToRelocate;
    if (command.yearsExperience   != null) back.yearsExperience   = command.yearsExperience;
    if (command.linkedinUrl       != null) back.linkedinUrl       = command.linkedinUrl;
    if (command.githubUrl         != null) back.githubUrl         = command.githubUrl;
    if (command.portfolioUrl      != null) back.portfolioUrl      = command.portfolioUrl;
    if (Object.keys(back).length) {
      try {
        await CandidateProfile.upsert({ userId: command.userId, ...back });
        syncCandidateSafe(command.userId);
      } catch { /* persist-back is best-effort — never block the application */ }
    }

    syncApplicationSafe(app.id);

    // Notify the recruiter who owns the job (fire-and-forget — never block the applicant)
    if (job.recruiterId) {
      createNotificationHandler.handle(new CreateNotificationCommand({
        userId:  job.recruiterId,
        type:    'application_received',
        title:   'New Application',
        message: `New application received for "${job.title}"`,
        link:    '/recruiter/applicants/job-seekers',
      })).catch(() => {});
    }

    return { id: app.id, jobId: app.jobId, status: 'in_review', message: 'Application submitted — In review' };
  }
}

module.exports = new ApplyToJobHandler();
