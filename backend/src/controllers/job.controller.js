const CreateJobCommand        = require('../application/job/commands/CreateJob.command');
const UpdateJobCommand        = require('../application/job/commands/UpdateJob.command');
const UpdateJobStatusCommand  = require('../application/job/commands/UpdateJobStatus.command');
const DeleteJobCommand        = require('../application/job/commands/DeleteJob.command');
const GetJobsQuery            = require('../application/job/queries/GetJobs.query');
const GetJobByIdQuery         = require('../application/job/queries/GetJobById.query');
const createJobHandler        = require('../application/job/handlers/CreateJobHandler');
const updateJobHandler        = require('../application/job/handlers/UpdateJobHandler');
const updateJobStatusHandler  = require('../application/job/handlers/UpdateJobStatusHandler');
const deleteJobHandler        = require('../application/job/handlers/DeleteJobHandler');
const getJobsHandler          = require('../application/job/handlers/GetJobsHandler');
const getJobByIdHandler       = require('../application/job/handlers/GetJobByIdHandler');
const JobDTO                  = require('../dtos/job.dto');

// Public read — excludes invite-only freelance jobs (candidates can't apply to them)
const getAll = async (req, res, next) => {
  try {
    const r = await getJobsHandler.handle(new GetJobsQuery({ ...req.query, excludeInviteOnly: true }));
    res.json({ ...r, data: JobDTO.fromList(r.data) });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const r = await getJobByIdHandler.handle(new GetJobByIdQuery(Number(req.params.id)));
    if (!r) return res.status(404).json({ message: 'Job not found' });
    res.json(JobDTO.from(r));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const r = await createJobHandler.handle(new CreateJobCommand({
      ...req.body,
      companyId:   req.user.companyId,
      recruiterId: req.user.id,
    }));
    res.status(201).json(JobDTO.from(r));
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const r = await updateJobHandler.handle(new UpdateJobCommand(Number(req.params.id), req.body));
    if (!r) return res.status(404).json({ message: 'Job not found' });
    res.json(JobDTO.from(r));
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const r = await updateJobStatusHandler.handle(
      new UpdateJobStatusCommand(Number(req.params.id), req.body.status)
    );
    if (!r) return res.status(404).json({ message: 'Job not found' });
    res.json(JobDTO.from(r));
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const r = await deleteJobHandler.handle(new DeleteJobCommand(Number(req.params.id)));
    if (!r) return res.status(404).json({ message: 'Job not found' });
    res.json(r);
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, updateStatus, delete: remove };
