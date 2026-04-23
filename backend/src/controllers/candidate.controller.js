const GetCandidateProfileQuery      = require('../application/candidate/queries/GetCandidateProfile.query');
const UpdateCandidateProfileCommand = require('../application/candidate/commands/UpdateCandidateProfile.command');
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
const addSkillHandler               = require('../application/candidate/handlers/AddSkillHandler');
const deleteSkillHandler            = require('../application/candidate/handlers/DeleteSkillHandler');
const addExperienceHandler          = require('../application/candidate/handlers/AddExperienceHandler');
const updateExperienceHandler       = require('../application/candidate/handlers/UpdateExperienceHandler');
const deleteExperienceHandler       = require('../application/candidate/handlers/DeleteExperienceHandler');
const addEducationHandler           = require('../application/candidate/handlers/AddEducationHandler');
const updateEducationHandler        = require('../application/candidate/handlers/UpdateEducationHandler');
const deleteEducationHandler        = require('../application/candidate/handlers/DeleteEducationHandler');

const CandidateProfileDTO = require('../dtos/candidate.dto');

const getProfile      = (req, res) => getCandidateProfileHandler.handle(new GetCandidateProfileQuery(req.user.id))
  .then(r => r ? res.json(CandidateProfileDTO.from(r)) : res.status(404).json({ message: 'Profile not found' }));

const updateProfile   = (req, res) => updateCandidateProfileHandler.handle(new UpdateCandidateProfileCommand({ userId: req.user.id, ...req.body }))
  .then(r => res.json(r));

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

module.exports = {
  getProfile, updateProfile,
  addSkill, deleteSkill,
  addExperience, updateExperience, deleteExperience,
  addEducation, updateEducation, deleteEducation,
};
