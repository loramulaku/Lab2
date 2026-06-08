const SendInvitationCommand    = require('../application/invitation/commands/SendInvitation.command');
const AcceptInvitationCommand  = require('../application/invitation/commands/AcceptInvitation.command');
const ConfirmInvitationCommand = require('../application/invitation/commands/ConfirmInvitation.command');
const RejectInvitationCommand  = require('../application/invitation/commands/RejectInvitation.command');
const RevokeInvitationCommand  = require('../application/invitation/commands/RevokeInvitation.command');
const GetMyInvitationsQuery     = require('../application/invitation/queries/GetMyInvitations.query');
const GetInvitationsByJobQuery  = require('../application/invitation/queries/GetInvitationsByJob.query');
const SearchFreelancersQuery    = require('../application/invitation/queries/SearchFreelancers.query');

const sendInvitationHandler        = require('../application/invitation/handlers/SendInvitationHandler');
const acceptInvitationHandler      = require('../application/invitation/handlers/AcceptInvitationHandler');
const confirmInvitationHandler     = require('../application/invitation/handlers/ConfirmInvitationHandler');
const rejectInvitationHandler      = require('../application/invitation/handlers/RejectInvitationHandler');
const revokeInvitationHandler      = require('../application/invitation/handlers/RevokeInvitationHandler');
const getMyInvitationsHandler      = require('../application/invitation/handlers/GetMyInvitationsHandler');
const getInvitationsByJobHandler   = require('../application/invitation/handlers/GetInvitationsByJobHandler');
const searchFreelancersHandler     = require('../application/invitation/handlers/SearchFreelancersHandler');

const InvitationDTO = require('../dtos/invitation.dto');
const ContractDTO   = require('../dtos/contract.dto');
const auditLog      = require('../utils/audit');

const searchFreelancers = (req, res, next) =>
  searchFreelancersHandler.handle(new SearchFreelancersQuery(req.query))
    .then(r => res.json(r))
    .catch(next);

const send = async (req, res, next) => {
  try {
    const r = await sendInvitationHandler.handle(new SendInvitationCommand({
      ...req.body,
      companyId: req.user.companyId,
    }));
    auditLog(req, { action: 'INVITATION_SEND', entity: 'Invitation', entityId: r.id });
    res.status(201).json(InvitationDTO.from(r));
  } catch (err) { next(err); }
};

const listMine = (req, res, next) =>
  getMyInvitationsHandler.handle(new GetMyInvitationsQuery(req.user.id, req.query))
    .then(r => res.json({ ...r, data: InvitationDTO.fromList(r.data) }))
    .catch(next);

const listByJob = (req, res, next) =>
  getInvitationsByJobHandler.handle(new GetInvitationsByJobQuery(Number(req.params.jobId), req.query))
    .then(r => res.json({ ...r, data: InvitationDTO.fromList(r.data) }))
    .catch(next);

const accept = (req, res, next) =>
  acceptInvitationHandler.handle(new AcceptInvitationCommand(Number(req.params.id), req.user.id))
    .then(r => res.status(201).json(ContractDTO.from(r)))
    .catch(next);

const confirm = (req, res, next) =>
  confirmInvitationHandler.handle(new ConfirmInvitationCommand({
    invitationId: Number(req.params.id),
    freelancerId: req.user.id,
  }))
    .then(r => res.json(InvitationDTO.from(r)))
    .catch(next);

const reject = (req, res, next) =>
  rejectInvitationHandler.handle(new RejectInvitationCommand(Number(req.params.id), req.user.id))
    .then(r => res.json(InvitationDTO.from(r)))
    .catch(next);

const revoke = (req, res, next) =>
  revokeInvitationHandler.handle(new RevokeInvitationCommand(Number(req.params.id), req.user.companyId))
    .then(r => res.json(InvitationDTO.from(r)))
    .catch(next);

module.exports = { searchFreelancers, send, listMine, listByJob, accept, confirm, reject, revoke };
