const express = require('express');
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const router  = express.Router();
const auth    = require('../middlewares/auth');
const c       = require('../controllers/candidate.controller');

// CV upload — stored once on the profile, reused (prefilled) on every application.
const CV_DIR = path.join(__dirname, '../../public/uploads/cvs');
fs.mkdirSync(CV_DIR, { recursive: true });

const cvUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, CV_DIR),
    filename: (req, file, cb) => cb(null, `cv_user_${req.user.id}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /pdf|msword|officedocument|document/.test(file.mimetype) || /\.(pdf|doc|docx)$/i.test(file.originalname);
    return ok ? cb(null, true) : cb(new Error('Only PDF or Word documents are allowed'));
  },
});

// All routes require authentication
router.use(auth);

router.get('/profile',              c.getProfile);
router.put('/profile',              c.updateProfile);
router.put('/freelance',            c.setFreelanceMode);
router.post('/cv', cvUpload.single('cv'), c.uploadCv);

router.post('/applications',        c.applyToJob);
router.get('/applications',         c.getMyApplications);

router.get('/saved-jobs',           c.getSavedJobs);
router.get('/saved-job-ids',        c.getSavedJobIds);
router.post('/saved-jobs/:jobId',   c.saveJob);
router.delete('/saved-jobs/:jobId', c.unsaveJob);

router.post('/skills',              c.addSkill);
router.delete('/skills/:id',        c.deleteSkill);

router.post('/experiences',         c.addExperience);
router.put('/experiences/:id',      c.updateExperience);
router.delete('/experiences/:id',   c.deleteExperience);

router.post('/educations',          c.addEducation);
router.put('/educations/:id',       c.updateEducation);
router.delete('/educations/:id',    c.deleteEducation);

module.exports = router;
