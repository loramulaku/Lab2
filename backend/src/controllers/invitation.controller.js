const SendInvitationCommand       = require('../application/commands/SendInvitation.command');
const RespondToInvitationCommand  = require('../application/commands/RespondToInvitation.command');
const GetMyInvitationsQuery       = require('../application/queries/GetMyInvitations.query');
const sendInvitationHandler       = require('../application/handlers/SendInvitationHandler');
const respondToInvitationHandler  = require('../application/handlers/RespondToInvitationHandler');
const getMyInvitationsHandler     = require('../application/handlers/GetMyInvitationsHandler');
const InvitationDTO               = require('../dtos/invitation.dto');

const invitationController = {
  async send(req, res) {
    const command = new SendInvitationCommand({
      companyId:        req.user.companyId,
      freelancerId:     Number(req.body.freelancerId),
      jobId:            req.body.jobId ? Number(req.body.jobId) : null,
      price:            Number(req.body.price),
      deliveryTimeDays: Number(req.body.deliveryTimeDays),
      message:          req.body.message,
    });
    const invitation = await sendInvitationHandler.handle(command);
    return res.status(201).json(InvitationDTO.from(invitation));
  },

  async getMine(req, res) {
    const query  = new GetMyInvitationsQuery({ userId: req.user.id, ...req.query });
    const result = await getMyInvitationsHandler.handle(query);
    return res.json({ ...result, data: InvitationDTO.fromList(result.data) });
  },

  async respond(req, res) {
    const command = new RespondToInvitationCommand({
      invitationId: Number(req.params.id),
      userId:       req.user.id,
      response:     req.body.response,
    });
    const invitation = await respondToInvitationHandler.handle(command);
    return res.json(InvitationDTO.from(invitation));
  },
};

module.exports = invitationController;
