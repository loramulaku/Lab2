const ApplyToJobCommand          = require('../application/commands/ApplyToJob.command');
const GetMyApplicationsQuery     = require('../application/queries/GetMyApplications.query');
const GetJobApplicationsQuery    = require('../application/queries/GetJobApplications.query');
const applyToJobHandler          = require('../application/handlers/ApplyToJobHandler');
const getMyApplicationsHandler   = require('../application/handlers/GetMyApplicationsHandler');
const getJobApplicationsHandler  = require('../application/handlers/GetJobApplicationsHandler');
const ApplicationDTO             = require('../dtos/application.dto');

const applicationController = {
  async apply(req, res) {
    const command = new ApplyToJobCommand({
      jobId:       Number(req.params.jobId),
      userId:      req.user.id,
      coverLetter: req.body.coverLetter,
    });
    const application = await applyToJobHandler.handle(command);
    return res.status(201).json(ApplicationDTO.from(application));
  },

  async getMine(req, res) {
    const query  = new GetMyApplicationsQuery({ userId: req.user.id, ...req.query });
    const result = await getMyApplicationsHandler.handle(query);
    return res.json({ ...result, data: ApplicationDTO.fromList(result.data) });
  },

  async getForJob(req, res) {
    const query  = new GetJobApplicationsQuery({ jobId: Number(req.params.jobId), ...req.query });
    const result = await getJobApplicationsHandler.handle(query);
    return res.json({ ...result, data: ApplicationDTO.fromList(result.data) });
  },
};

module.exports = applicationController;
