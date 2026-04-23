const express = require('express');
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const router  = express.Router();
const auth    = require('../middlewares/auth');
const c       = require('../controllers/recruiter.controller');

// Logo upload — separate multer config (uploads to /public/uploads/logos/)
const LOGO_DIR = path.join(__dirname, '../../public/uploads/logos');
fs.mkdirSync(LOGO_DIR, { recursive: true });

const logoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, LOGO_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `company_${req.user.id}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

router.use(auth);

router.get('/profile',       c.getProfile);
router.post('/setup',        c.setup);
router.post('/logo', logoUpload.single('logo'), c.uploadLogo);

module.exports = router;
