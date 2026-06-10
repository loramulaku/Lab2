const Invitation = require('../../../models/sql/Invitation');
const User       = require('../../../models/sql/User');
const jobMysqlRepo       = require('../../../repositories/mysql/job.repo');
const { invitesAllowed } = require('../../_shared/jobModePolicy');
const { httpError }      = require('../../_shared/ContractService');
const { syncInvitationSafe }         = require('../../../sync/invitationSync');
const { sendInvitationEmail }        = require('../../../emails/invitationEmail');
const CreateNotificationCommand      = require('../../notification/commands/CreateNotification.command');
const createNotificationHandler      = require('../../notification/handlers/CreateNotificationHandler');

/**
 * Recruiter sends a direct invitation (Mode B).
 * The invitation must reference an existing job (draft or open) so that an
 * acceptance has a job to anchor the contract to — see the design note on
 * why job_id is required here even though the column is nullable.
 */
class SendInvitationHandler {
  async handle(command) {
    if (!command.jobId) {
      throw httpError(400, 'jobId is required to send an invitation', 'JOB_REQUIRED');
    }

    const job = await jobMysqlRepo.findById(command.jobId);
    if (!job) throw httpError(404, 'Job not found', 'JOB_NOT_FOUND');
    if (job.companyId !== command.companyId) {
      throw httpError(403, 'You do not own this job', 'FORBIDDEN');
    }
    if (!invitesAllowed(job)) {
      throw httpError(403, 'This job does not allow direct invitations', 'INVITES_NOT_ALLOWED');
    }
    if (!['draft', 'open'].includes(job.status)) {
      throw httpError(409, 'Cannot invite on a closed or archived job', 'JOB_NOT_OPEN');
    }

    const freelancer = await User.findByPk(command.freelancerId);
    if (!freelancer || !freelancer.isActive) {
      throw httpError(404, 'Freelancer not found or inactive', 'FREELANCER_NOT_FOUND');
    }

    let invitation;
    try {
      invitation = await Invitation.create({
        companyId:        command.companyId,
        freelancerId:     command.freelancerId,
        jobId:            command.jobId,
        title:            command.title ?? job.title,
        message:          command.message,
        priceOffer:       command.priceOffer,
        deliveryTimeDays: command.deliveryTimeDays,
        expiresAt:        command.expiresAt,
        status:           'pending',
        activeKey:        `${command.jobId}:${command.freelancerId}`,
        createdAt:        new Date(),
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw httpError(409, 'This freelancer already has a pending invitation for this job', 'ALREADY_INVITED');
      }
      throw err;
    }

    syncInvitationSafe(invitation.id);

    const relativePath = '/my-profile?tab=freelance&sub=invitations';

    // In-app notification — fire-and-forget (stores relative path for client-side navigation)
    createNotificationHandler.handle(new CreateNotificationCommand({
      userId:  command.freelancerId,
      type:    'invitation_received',
      title:   'Invitation Received',
      message: `You have a new invitation for "${job.title}"`,
      link:    relativePath,
    })).catch(err => console.error('[notification] Failed to create invitation notification:', err.message));

    // Email notification — fire-and-forget (full URL required for email links)
    sendInvitationEmail({ invitation, job, freelancer }).catch(err =>
      console.error('[mailer] Failed to send invitation email:', err.message)
    );

    return invitation;
  }
}

module.exports = new SendInvitationHandler();
