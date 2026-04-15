const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth');
const upload  = require('../middlewares/upload');
const User    = require('../models/sql/User');

router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const avatarPath = `/uploads/avatars/${req.file.filename}`;
  await User.update({ avatarPath }, { where: { id: req.user.id } });
  return res.json({ path: avatarPath });
});

module.exports = router;
