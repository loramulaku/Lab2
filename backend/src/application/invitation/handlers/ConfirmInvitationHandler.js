const Invitation        = require('../../../models/sql/Invitation');
const User              = require('../../../models/sql/User');
const RecruiterProfile  = require('../../../models/sql/RecruiterProfile');
const { httpError }          = require('../../_shared/ContractService');
const { syncInvitationSafe } = require('../../../sync/invitationSync');
const CreateNotificationCommand = require('../../notification/commands/CreateNotification.command');
const createNotificationHandler = require('../../notification/handlers/CreateNotificationHandler');

/**
 * Freelancer confirms a pending invitation — signals availability to the recruiter.
 * Does NOT create a contract; the recruiter then decides to proceed (Make a Contract)
 * or reject. Status transitions: pending → confirmed.
 */
class ConfirmInvitationHandler {
  async handle(command) {
    const inv = await Invitation.findByPk(command.invitationId);
    if (!inv) throw httpError(404, 'Invitation not found', 'INVITATION_NOT_FOUND');
    if (inv.freelancerId !== command.freelancerId) {
      throw httpError(403, 'This invitation is not addressed to you', 'FORBIDDEN');
    }
    if (inv.status !== 'pending') {
      throw httpError(409, `Invitation is already ${inv.status}`, 'INVITATION_NOT_PENDING');
    }

    const freelancer = await User.findByPk(command.freelancerId);

    await inv.update({ status: 'confirmed', respondedAt: new Date(), updatedAt: new Date() });
    syncInvitationSafe(inv.id);

    // Notify all recruiters of the company via RecruiterProfile → User (fire-and-forget)
    const jobTitle       = inv.title ?? `Job #${inv.jobId}`;
    const freelancerName = freelancer
      ? `${freelancer.firstName ?? ''} ${freelancer.lastName ?? ''}`.trim()
      : 'A freelancer';

    RecruiterProfile.findAll({ where: { companyId: inv.companyId } })
      .then(profiles => {
        for (const profile of profiles) {
          createNotificationHandler.handle(new CreateNotificationCommand({
            userId:  profile.userId,
            type:    'invitation_confirmed',
            message: `${freelancerName} confirmed your invitation for "${jobTitle}"`,
            link:    '/recruiter/freelancers/invited',
          })).catch(() => {});
        }
      })
      .catch(() => {});

    return inv;
  }
}

module.exports = new ConfirmInvitationHandler();
