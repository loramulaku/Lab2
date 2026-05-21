const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth');
const c       = require('../controllers/candidate.controller');

// All routes require authentication
router.use(auth);

router.get('/profile',              c.getProfile);
router.put('/profile',              c.updateProfile);

router.post('/skills',              c.addSkill);
router.delete('/skills/:id',        c.deleteSkill);

router.post('/experiences',         c.addExperience);
router.put('/experiences/:id',      c.updateExperience);
router.delete('/experiences/:id',   c.deleteExperience);

router.post('/educations',          c.addEducation);
router.put('/educations/:id',       c.updateEducation);
router.delete('/educations/:id',    c.deleteEducation);

module.exports = router;
