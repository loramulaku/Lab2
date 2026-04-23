const CreateJobCommand  = require('../application/job/commands/CreateJob.command');
const UpdateJobCommand  = require('../application/job/commands/UpdateJob.command');
const DeleteJobCommand  = require('../application/job/commands/DeleteJob.command');
const GetJobsQuery      = require('../application/job/queries/GetJobs.query');
const GetJobByIdQuery   = require('../application/job/queries/GetJobById.query');

const createJobHandler  = require('../application/job/handlers/CreateJobHandler');
const updateJobHandler  = require('../application/job/handlers/UpdateJobHandler');
const deleteJobHandler  = require('../application/job/handlers/DeleteJobHandler');
const getJobsHandler    = require('../application/job/handlers/GetJobsHandler');
const getJobByIdHandler = require('../application/job/handlers/GetJobByIdHandler');

const JobDTO = require('../dtos/job.dto');

const getAll  = (req, res) =>
  getJobsHandler.handle(new GetJobsQuery(req.query))
    .then(r => res.json({ ...r, data: JobDTO.fromList(r.data) }));

const getById = (req, res) =>
  getJobByIdHandler.handle(new GetJobByIdQuery(Number(req.params.id)))
    .then(r => r ? res.json(JobDTO.from(r)) : res.status(404).json({ message: 'Job not found' }));

const create  = (req, res) =>
  createJobHandler.handle(new CreateJobCommand({ ...req.body, companyId: req.user.companyId }))
    .then(r => res.status(201).json(JobDTO.from(r)));

const update  = (req, res) =>
  updateJobHandler.handle(new UpdateJobCommand(Number(req.params.id), req.body))
    .then(r => r ? res.json(JobDTO.from(r)) : res.status(404).json({ message: 'Job not found' }));

const remove  = (req, res) =>
  deleteJobHandler.handle(new DeleteJobCommand(Number(req.params.id)))
    .then(r => r ? res.json(r) : res.status(404).json({ message: 'Job not found' }));

module.exports = { getAll, getById, create, update, delete: remove };
