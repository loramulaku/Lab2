const GetMyContractsQuery   = require('../application/contract/queries/GetMyContracts.query');
const GetContractByIdQuery  = require('../application/contract/queries/GetContractById.query');
const getMyContractsHandler  = require('../application/contract/handlers/GetMyContractsHandler');
const getContractByIdHandler = require('../application/contract/handlers/GetContractByIdHandler');
const ContractDTO = require('../dtos/contract.dto');

// Scope the list to the caller: freelancers see their own, recruiters see their company's.
const listMine = (req, res, next) => {
  const roles = req.user.roles ?? [];
  const opts = { ...req.query };
  if (roles.includes('recruiter') && !roles.includes('admin')) opts.companyId = req.user.companyId;
  else if (roles.includes('candidate')) opts.freelancerId = req.user.id;
  return getMyContractsHandler.handle(new GetMyContractsQuery(opts))
    .then(r => res.json({ ...r, data: ContractDTO.fromList(r.data) }))
    .catch(next);
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

module.exports = { listMine, getById };
