const GetRecruiterProfileQuery = require('../application/recruiter/queries/GetRecruiterProfile.query');
const SetupRecruiterCommand    = require('../application/recruiter/commands/SetupRecruiter.command');
const UploadLogoCommand        = require('../application/recruiter/commands/UploadLogo.command');

const getRecruiterProfileHandler = require('../application/recruiter/handlers/GetRecruiterProfileHandler');
const setupRecruiterHandler      = require('../application/recruiter/handlers/SetupRecruiterHandler');
const uploadLogoHandler          = require('../application/recruiter/handlers/UploadLogoHandler');

const RecruiterProfileDTO = require('../dtos/recruiter.dto');

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

module.exports = { getProfile, setup, uploadLogo };
