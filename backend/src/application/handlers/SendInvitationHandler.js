const jobMysqlRepo              = require('../../repositories/mysql/job.repo');
const userRepo                  = require('../../repositories/mysql/user.repo');
const invitationRepo            = require('../../repositories/mysql/invitation.repo');
const { syncInvitationSafe }    = require('../../sync/invitationSync');

class SendInvitationHandler {
  async handle(command) {
    const freelancer = await userRepo.findById(command.freelancerId);
    if (!freelancer) {
      const err = new Error('Freelancer not found'); err.status = 404; throw err;
    }

    if (command.jobId) {
      const job = await jobMysqlRepo.findById(command.jobId);
      if (!job) {
        const err = new Error('Job not found'); err.status = 404; throw err;
      }
      if (job.employmentType !== 'freelance') {
        const err = new Error('Invitations can only be sent for freelance jobs'); err.status = 400; throw err;
      }
      if (job.jobMode === 'public') {
        const err = new Error('This job is public — freelancers apply via bids'); err.status = 400; throw err;
      }
    }

    if (!command.price || command.price <= 0) {
      const err = new Error('price must be a positive number'); err.status = 400; throw err;
    }
    if (!command.deliveryTimeDays || command.deliveryTimeDays <= 0) {
      const err = new Error('deliveryTimeDays must be a positive number'); err.status = 400; throw err;
    }

    const invitation = await invitationRepo.create({
      companyId:        command.companyId,
      freelancerId:     command.freelancerId,
      jobId:            command.jobId,
      message:          command.message,
      priceOffer:       command.price,
      deliveryTimeDays: command.deliveryTimeDays,
      status:           'pending',
      createdAt:        new Date(),
    });

    syncInvitationSafe(invitation.id);
    return invitation;
  }
}

module.exports = new SendInvitationHandler();
