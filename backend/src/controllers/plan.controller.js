const CreatePlanCommand = require('../application/plan/commands/CreatePlan.command');
const UpdatePlanCommand = require('../application/plan/commands/UpdatePlan.command');
const DeletePlanCommand = require('../application/plan/commands/DeletePlan.command');
const GetPlansQuery     = require('../application/plan/queries/GetPlans.query');
const createPlanHandler = require('../application/plan/handlers/CreatePlanHandler');
const updatePlanHandler = require('../application/plan/handlers/UpdatePlanHandler');
const deletePlanHandler = require('../application/plan/handlers/DeletePlanHandler');
const getPlansHandler   = require('../application/plan/handlers/GetPlansHandler');
const PlanDTO           = require('../dtos/plan.dto');

const getAll = (req, res) => {
  const activeOnly = req.user?.roles?.includes('admin') ? false : true;
  return getPlansHandler.handle(new GetPlansQuery({ activeOnly }))
    .then(result => res.json(PlanDTO.fromList(result.data)));
};

const create = (req, res) =>
  createPlanHandler.handle(new CreatePlanCommand(req.body))
    .then(r => res.status(201).json({ id: r.id, message: 'Plan created' }));

const update = (req, res) =>
  updatePlanHandler.handle(new UpdatePlanCommand({ id: req.params.id, ...req.body }))
    .then(r => res.json({ id: r.id, message: 'Plan updated' }));

const remove = (req, res) =>
  deletePlanHandler.handle(new DeletePlanCommand(req.params.id))
    .then(r => res.json(r));

module.exports = { getAll, create, update, delete: remove };
