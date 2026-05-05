const invitationRepo         = require('../../repositories/mysql/invitation.repo');
const contractRepo           = require('../../repositories/mysql/contract.repo');
const jobMysqlRepo           = require('../../repositories/mysql/job.repo');
const { syncInvitationSafe } = require('../../sync/invitationSync');

class RespondToInvitationHandler {
  async handle(command) {
    const invitation = await invitationRepo.findById(command.invitationId);
    if (!invitation) {
      const err = new Error('Invitation not found'); err.status = 404; throw err;
    }
    if (invitation.freelancerId !== command.userId) {
      const err = new Error('Forbidden'); err.status = 403; throw err;
    }
    if (invitation.status !== 'pending') {
      const err = new Error('Invitation has already been responded to'); err.status = 400; throw err;
    }
    if (!['accepted', 'rejected'].includes(command.response)) {
      const err = new Error('response must be accepted or rejected'); err.status = 400; throw err;
    }

    await invitationRepo.update(invitation.id, { status: command.response });

    if (command.response === 'accepted') {
      const startDate = new Date();
      const endDate   = new Date();
      endDate.setDate(endDate.getDate() + (invitation.deliveryTimeDays ?? 0));

      await contractRepo.create({
        jobId:        invitation.jobId,
        freelancerId: invitation.freelancerId,
        companyId:    invitation.companyId,
        bidId:        null,
        agreedPrice:  invitation.priceOffer,
        startDate:    startDate.toISOString().split('T')[0],
        endDate:      endDate.toISOString().split('T')[0],
        status:       'active',
      });

      // Close the job if it was invite-only
      if (invitation.jobId) {
        const job = await jobMysqlRepo.findById(invitation.jobId);
        if (job?.jobMode === 'invite') {
          await jobMysqlRepo.update(invitation.jobId, { status: 'closed' });
        }
      }
    }

    syncInvitationSafe(invitation.id);
    return invitationRepo.findById(invitation.id);
  }
}

module.exports = new RespondToInvitationHandler();
