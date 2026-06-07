const GetCandidateProfileQuery      = require('../application/candidate/queries/GetCandidateProfile.query');
const UpdateCandidateProfileCommand = require('../application/candidate/commands/UpdateCandidateProfile.command');
const SetFreelanceModeCommand       = require('../application/candidate/commands/SetFreelanceMode.command');
const ApplyToJobCommand             = require('../application/application/commands/ApplyToJob.command');
const GetMyApplicationsQuery        = require('../application/application/queries/GetMyApplications.query');
const UploadCvCommand               = require('../application/candidate/commands/UploadCv.command');
const AddSkillCommand               = require('../application/candidate/commands/AddSkill.command');
const DeleteSkillCommand            = require('../application/candidate/commands/DeleteSkill.command');
const AddExperienceCommand          = require('../application/candidate/commands/AddExperience.command');
const UpdateExperienceCommand       = require('../application/candidate/commands/UpdateExperience.command');
const DeleteExperienceCommand       = require('../application/candidate/commands/DeleteExperience.command');
const AddEducationCommand           = require('../application/candidate/commands/AddEducation.command');
const UpdateEducationCommand        = require('../application/candidate/commands/UpdateEducation.command');
const DeleteEducationCommand        = require('../application/candidate/commands/DeleteEducation.command');

const getCandidateProfileHandler    = require('../application/candidate/handlers/GetCandidateProfileHandler');
const updateCandidateProfileHandler = require('../application/candidate/handlers/UpdateCandidateProfileHandler');
const setFreelanceModeHandler       = require('../application/candidate/handlers/SetFreelanceModeHandler');
const applyToJobHandler             = require('../application/application/handlers/ApplyToJobHandler');
const getMyApplicationsHandler      = require('../application/application/handlers/GetMyApplicationsHandler');
const uploadCvHandler               = require('../application/candidate/handlers/UploadCvHandler');
const addSkillHandler               = require('../application/candidate/handlers/AddSkillHandler');
const deleteSkillHandler            = require('../application/candidate/handlers/DeleteSkillHandler');
const addExperienceHandler          = require('../application/candidate/handlers/AddExperienceHandler');
const updateExperienceHandler       = require('../application/candidate/handlers/UpdateExperienceHandler');
const deleteExperienceHandler       = require('../application/candidate/handlers/DeleteExperienceHandler');
const addEducationHandler           = require('../application/candidate/handlers/AddEducationHandler');
const updateEducationHandler        = require('../application/candidate/handlers/UpdateEducationHandler');
const deleteEducationHandler        = require('../application/candidate/handlers/DeleteEducationHandler');

const CandidateProfileDTO = require('../dtos/candidate.dto');
const ApplicationDTO      = require('../dtos/application.dto');
const SavedJob            = require('../models/sql/SavedJob');
const Job                 = require('../models/sql/Job');
const Company             = require('../models/sql/Company');
const Application         = require('../models/sql/Application');
const PipelineNote        = require('../models/sql/PipelineNote');
const PipelineStage       = require('../models/sql/PipelineStage');

const getProfile      = (req, res) => getCandidateProfileHandler.handle(new GetCandidateProfileQuery(req.user.id))
  .then(r => r ? res.json(CandidateProfileDTO.from(r)) : res.status(404).json({ message: 'Profile not found' }));

const updateProfile   = (req, res) => updateCandidateProfileHandler.handle(new UpdateCandidateProfileCommand({ userId: req.user.id, ...req.body }))
  .then(r => res.json(r));

const setFreelanceMode = (req, res) => setFreelanceModeHandler.handle(new SetFreelanceModeCommand({ userId: req.user.id, active: req.body.active }))
  .then(r => res.json(r));

const applyToJob = (req, res) => applyToJobHandler.handle(new ApplyToJobCommand({ userId: req.user.id, ...req.body }))
  .then(r => res.status(201).json(r))
  .catch(err => res.status(err.status || 500).json({ message: err.message || 'Failed to apply' }));

const uploadCv = (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const cvPath = `/uploads/cvs/${req.file.filename}`;
  return uploadCvHandler.handle(new UploadCvCommand({ userId: req.user.id, cvPath }))
    .then(() => res.json({ path: cvPath }))
    .catch(err => res.status(err.status || 500).json({ message: err.message || 'Failed to upload CV' }));
};

const getMyApplications = (req, res) => getMyApplicationsHandler.handle(new GetMyApplicationsQuery(req.user.id, req.query))
  .then(r => res.json({ ...r, data: ApplicationDTO.fromList(r.data) }));

const addSkill        = (req, res) => addSkillHandler.handle(new AddSkillCommand({ userId: req.user.id, ...req.body }))
  .then(r => res.status(201).json(r));

const deleteSkill     = (req, res) => deleteSkillHandler.handle(new DeleteSkillCommand({ userId: req.user.id, skillId: Number(req.params.id) }))
  .then(r => res.json(r));

const addExperience   = (req, res) => addExperienceHandler.handle(new AddExperienceCommand({ userId: req.user.id, ...req.body }))
  .then(r => res.status(201).json(r));

const updateExperience = (req, res) => updateExperienceHandler.handle(new UpdateExperienceCommand({ userId: req.user.id, experienceId: Number(req.params.id), ...req.body }))
  .then(r => res.json(r));

const deleteExperience = (req, res) => deleteExperienceHandler.handle(new DeleteExperienceCommand({ userId: req.user.id, experienceId: Number(req.params.id) }))
  .then(r => res.json(r));

const addEducation    = (req, res) => addEducationHandler.handle(new AddEducationCommand({ userId: req.user.id, ...req.body }))
  .then(r => res.status(201).json(r));

const updateEducation = (req, res) => updateEducationHandler.handle(new UpdateEducationCommand({ userId: req.user.id, educationId: Number(req.params.id), ...req.body }))
  .then(r => res.json(r));

const deleteEducation = (req, res) => deleteEducationHandler.handle(new DeleteEducationCommand({ userId: req.user.id, educationId: Number(req.params.id) }))
  .then(r => res.json(r));

const getSavedJobs = async (req, res, next) => {
  try {
    const rows = await SavedJob.findAll({
      where: { userId: req.user.id },
      include: [{ model: Job, as: 'Job', include: [{ model: Company, attributes: ['id', 'name', 'logoPath'] }] }],
      order: [['created_at', 'DESC']],
    });
    res.json(rows.map(r => ({
      savedAt:  r.created_at,
      id:       r.Job?.id,
      title:    r.Job?.title,
      company:  r.Job ? { name: r.Job.Company?.name, logoPath: r.Job.Company?.logoPath } : null,
      employmentType: r.Job?.employmentType,
      workMode: r.Job?.workMode,
      status:   r.Job?.status,
    })));
  } catch (err) { next(err); }
};

const saveJob = async (req, res, next) => {
  try {
    await SavedJob.findOrCreate({ where: { userId: req.user.id, jobId: Number(req.params.jobId) } });
    res.json({ saved: true });
  } catch (err) { next(err); }
};

const unsaveJob = async (req, res, next) => {
  try {
    await SavedJob.destroy({ where: { userId: req.user.id, jobId: Number(req.params.jobId) } });
    res.json({ saved: false });
  } catch (err) { next(err); }
};

const getSavedJobIds = async (req, res, next) => {
  try {
    const rows = await SavedJob.findAll({ where: { userId: req.user.id }, attributes: ['jobId'] });
    res.json(rows.map(r => r.jobId));
  } catch (err) { next(err); }
};

// GET /api/candidate/applications/:applicationId/notes
const getApplicationNotes = async (req, res, next) => {
  try {
    const applicationId = Number(req.params.applicationId);
    const app = await Application.findByPk(applicationId, { attributes: ['id', 'userId'] });
    if (!app || app.userId !== req.user.id) return res.status(404).json({ message: 'Not found' });

    const notes = await PipelineNote.findAll({
      where: { applicationId },
      order: [['created_at', 'ASC']],
    });

    const stageIds = [...new Set(notes.map(n => n.stageId))];
    const stages   = stageIds.length
      ? await PipelineStage.findAll({ where: { id: stageIds }, attributes: ['id', 'name'] })
      : [];
    const stageMap = Object.fromEntries(stages.map(s => [s.id, s.name]));

    res.json(notes.map(n => ({
      id:        n.id,
      note:      n.note,
      stageId:   n.stageId,
      stageName: stageMap[n.stageId] ?? null,
      createdAt: n.createdAt,
    })));
  } catch (err) { next(err); }
};

module.exports = {
  getProfile, updateProfile, setFreelanceMode,
  applyToJob, getMyApplications, uploadCv,
  addSkill, deleteSkill,
  addExperience, updateExperience, deleteExperience,
  addEducation, updateEducation, deleteEducation,
  getSavedJobs, saveJob, unsaveJob, getSavedJobIds,
  getApplicationNotes,
};
