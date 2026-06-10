const GetMyContractsQuery    = require('../application/contract/queries/GetMyContracts.query');
const GetContractByIdQuery   = require('../application/contract/queries/GetContractById.query');
const CreateContractCommand  = require('../application/contract/commands/CreateContract.command');
const ApproveContractCommand = require('../application/contract/commands/ApproveContract.command');

const getMyContractsHandler   = require('../application/contract/handlers/GetMyContractsHandler');
const getContractByIdHandler  = require('../application/contract/handlers/GetContractByIdHandler');
const createContractHandler   = require('../application/contract/handlers/CreateContractHandler');
const approveContractHandler  = require('../application/contract/handlers/ApproveContractHandler');

const RecruiterProfile = require('../models/sql/RecruiterProfile');
const ContractDTO = require('../dtos/contract.dto');

async function resolveCompanyId(req) {
  if (req.user.companyId) return req.user.companyId;
  const profile = await RecruiterProfile.findOne({ where: { userId: req.user.id } });
  return profile?.companyId ?? null;
}

// Scope the list to the caller: freelancers see their own, recruiters see their company's.
const listMine = async (req, res, next) => {
  try {
    const roles = req.user.roles ?? [];
    const opts  = { ...req.query };
    if (roles.includes('recruiter') && !roles.includes('admin')) {
      opts.companyId = await resolveCompanyId(req);
    } else if (roles.includes('candidate')) {
      opts.freelancerId = req.user.id;
    }
    const r = await getMyContractsHandler.handle(new GetMyContractsQuery(opts));
    return res.json({ ...r, data: ContractDTO.fromList(r.data) });
  } catch (err) {
    next(err);
  }
};

const getById = (req, res, next) =>
  getContractByIdHandler.handle(new GetContractByIdQuery(Number(req.params.id)))
    .then(c => {
      if (!c) return res.status(404).json({ message: 'Contract not found' });
      const roles = req.user.roles ?? [];
      const isParty = c.freelancerId === req.user.id
        || c.companyId === req.user.companyId
        || roles.includes('admin');
      if (!isParty) return res.status(403).json({ message: 'Forbidden' });
      return res.json(ContractDTO.from(c));
    })
    .catch(next);

// POST /contracts — recruiter creates a pending contract draft.
const create = async (req, res, next) => {
  try {
    const { source, bidId, invitationId, applicationId, agreedPrice, startDate, endDate } = req.body;
    if (!source || !agreedPrice || !startDate) {
      return res.status(400).json({ message: 'source, agreedPrice, and startDate are required' });
    }
    const companyId = await resolveCompanyId(req);
    if (!companyId) return res.status(400).json({ message: 'Recruiter company not found' });

    const contract = await createContractHandler.handle(new CreateContractCommand({
      companyId, source,
      bidId:         bidId        ? Number(bidId)        : null,
      invitationId:  invitationId ? Number(invitationId) : null,
      applicationId: applicationId? Number(applicationId): null,
      agreedPrice:   Number(agreedPrice),
      startDate, endDate: endDate || null,
    }));
    return res.status(201).json(ContractDTO.from(contract));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message, code: err.code });
    next(err);
  }
};

// POST /contracts/:id/approve — freelancer/candidate approves the pending contract.
const approve = async (req, res, next) => {
  try {
    const contract = await approveContractHandler.handle(new ApproveContractCommand({
      contractId: Number(req.params.id),
      userId:     req.user.id,
    }));
    return res.json(ContractDTO.from(contract));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message, code: err.code });
    next(err);
  }
};

module.exports = { listMine, getById, create, approve };
