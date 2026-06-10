const GetRecruiterProfileQuery = require('../application/recruiter/queries/GetRecruiterProfile.query');
const SetupRecruiterCommand    = require('../application/recruiter/commands/SetupRecruiter.command');
const UploadLogoCommand        = require('../application/recruiter/commands/UploadLogo.command');

const GetCompanyApplicantsQuery  = require('../application/application/queries/GetCompanyApplicants.query');
const ScheduleInterviewCommand   = require('../application/application/commands/ScheduleInterview.command');
const GetRecruiterJobsQuery      = require('../application/job/queries/GetRecruiterJobs.query');
const GetCompanyBidsQuery        = require('../application/bid/queries/GetCompanyBids.query');
const BrowseCandidatesQuery      = require('../application/candidate/queries/BrowseCandidates.query');
const GetCompanyTeamQuery        = require('../application/recruiter/queries/GetCompanyTeam.query');
const InviteTeamMemberCommand    = require('../application/recruiter/commands/InviteTeamMember.command');

const getRecruiterProfileHandler  = require('../application/recruiter/handlers/GetRecruiterProfileHandler');
const setupRecruiterHandler       = require('../application/recruiter/handlers/SetupRecruiterHandler');
const uploadLogoHandler           = require('../application/recruiter/handlers/UploadLogoHandler');
const getCompanyApplicantsHandler = require('../application/application/handlers/GetCompanyApplicantsHandler');
const scheduleInterviewHandler    = require('../application/application/handlers/ScheduleInterviewHandler');
const getRecruiterJobsHandler     = require('../application/job/handlers/GetRecruiterJobsHandler');
const getCompanyBidsHandler       = require('../application/bid/handlers/GetCompanyBidsHandler');
const browseCandidatesHandler    = require('../application/candidate/handlers/BrowseCandidatesHandler');
const getCompanyTeamHandler      = require('../application/recruiter/handlers/GetCompanyTeamHandler');
const inviteTeamMemberHandler    = require('../application/recruiter/handlers/InviteTeamMemberHandler');

const RecruiterProfile    = require('../models/sql/RecruiterProfile');
const RecruiterProfileDTO = require('../dtos/recruiter.dto');
const ApplicationDTO      = require('../dtos/application.dto');
const JobDTO              = require('../dtos/job.dto');
const BidDTO              = require('../dtos/bid.dto');

// companyId lives in the JWT, but a recruiter who set up their company after
// their last login won't have it yet — fall back to the RecruiterProfile row.
async function resolveCompanyId(req) {
  if (req.user.companyId) return req.user.companyId;
  const profile = await RecruiterProfile.findOne({ where: { userId: req.user.id } });
  return profile?.companyId ?? null;
}

const getProfile = (req, res) =>
  getRecruiterProfileHandler.handle(new GetRecruiterProfileQuery(req.user.id))
    .then(r => r ? res.json(RecruiterProfileDTO.from(r)) : res.status(404).json({ message: 'Profile not found' }));

const setup = (req, res) =>
  setupRecruiterHandler.handle(new SetupRecruiterCommand({ userId: req.user.id, ...req.body }))
    .then(r => res.json(r));

const uploadLogo = (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const logoPath = `/uploads/logos/${req.file.filename}`;
  return uploadLogoHandler.handle(new UploadLogoCommand({ userId: req.user.id, logoPath }))
    .then(r => res.json(r));
};

const getApplicants = async (req, res, next) => {
  try {
    const companyId = await resolveCompanyId(req);
    const result = await getCompanyApplicantsHandler.handle(new GetCompanyApplicantsQuery(companyId, req.query));
    res.json({ ...result, data: ApplicationDTO.fromList(result.data) });
  } catch (err) { next(err); }
};

const scheduleInterview = async (req, res, next) => {
  try {
    const companyId = await resolveCompanyId(req);
    const result = await scheduleInterviewHandler.handle(new ScheduleInterviewCommand({
      applicationId: req.params.id, companyId, interviewAt: req.body.interviewAt,
    }));
    res.json(result);
  } catch (err) { next(err); }
};

const listJobs = async (req, res, next) => {
  try {
    const companyId = await resolveCompanyId(req);
    const result = await getRecruiterJobsHandler.handle(
      new GetRecruiterJobsQuery(companyId, req.query)
    );
    res.json({ ...result, data: JobDTO.fromList(result.data) });
  } catch (err) { next(err); }
};

const getFreelancers = async (req, res, next) => {
  try {
    const companyId = await resolveCompanyId(req);
    const result = await getCompanyBidsHandler.handle(new GetCompanyBidsQuery(companyId, req.query));
    res.json({ ...result, data: BidDTO.fromList(result.data) });
  } catch (err) { next(err); }
};

const browseCandidates = (req, res, next) =>
  browseCandidatesHandler.handle(new BrowseCandidatesQuery(req.query))
    .then(r => res.json(r))
    .catch(next);

const getTeam = async (req, res, next) => {
  try {
    const companyId = await resolveCompanyId(req);
    if (!companyId) return res.status(400).json({ message: 'No company set up yet.' });
    const members = await getCompanyTeamHandler.handle(new GetCompanyTeamQuery(companyId));
    res.json(members);
  } catch (err) { next(err); }
};

const inviteTeamMember = async (req, res, next) => {
  try {
    const companyId = await resolveCompanyId(req);
    if (!companyId) return res.status(400).json({ message: 'No company set up yet.' });
    const result = await inviteTeamMemberHandler.handle(
      new InviteTeamMemberCommand({ companyId, ...req.body })
    );
    res.status(201).json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

module.exports = { getProfile, setup, uploadLogo, getApplicants, scheduleInterview, listJobs, getFreelancers, browseCandidates, getTeam, inviteTeamMember };
