const CreateJobCommand        = require('../application/commands/CreateJob.command');
const UpdateJobCommand        = require('../application/commands/UpdateJob.command');
const UpdateJobStatusCommand  = require('../application/commands/UpdateJobStatus.command');
const GetJobsQuery            = require('../application/queries/GetJobs.query');
const GetJobByIdQuery         = require('../application/queries/GetJobById.query');
const createJobHandler        = require('../application/handlers/CreateJobHandler');
const updateJobHandler        = require('../application/handlers/UpdateJobHandler');
const updateJobStatusHandler  = require('../application/handlers/UpdateJobStatusHandler');
const getJobsHandler          = require('../application/handlers/GetJobsHandler');
const getJobByIdHandler       = require('../application/handlers/GetJobByIdHandler');
const JobDTO                  = require('../dtos/job.dto');

const jobController = {
  async getAll(req, res) {
    const query  = new GetJobsQuery(req.query);
    const result = await getJobsHandler.handle(query);
    return res.json({ ...result, data: JobDTO.fromList(result.data) });
  },

  async getById(req, res) {
    const query = new GetJobByIdQuery(Number(req.params.id));
    const job   = await getJobByIdHandler.handle(query);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    return res.json(JobDTO.from(job));
  },

  async create(req, res) {
    const command = new CreateJobCommand({
      ...req.body,
      companyId:   req.user.companyId,
      recruiterId: req.user.id,
    });
    const job = await createJobHandler.handle(command);
    return res.status(201).json(JobDTO.from(job));
  },

  async update(req, res) {
    const command = new UpdateJobCommand(Number(req.params.id), req.body);
    const job     = await updateJobHandler.handle(command);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    return res.json(JobDTO.from(job));
  },

  async updateStatus(req, res) {
    const command = new UpdateJobStatusCommand(Number(req.params.id), req.body.status);
    const job     = await updateJobStatusHandler.handle(command);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    return res.json(JobDTO.from(job));
  },
};

module.exports = jobController;
