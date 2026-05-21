const express  = require('express');
const router   = express.Router();
const auth     = require('../middlewares/auth');
const upload   = require('../middlewares/upload');

const UploadAvatarCommand  = require('../application/user/commands/UploadAvatar.command');
const uploadAvatarHandler  = require('../application/user/handlers/UploadAvatarHandler');

router.post('/avatar', auth, upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const avatarPath = `/uploads/avatars/${req.file.filename}`;
  const command    = new UploadAvatarCommand({ userId: req.user.id, avatarPath, roles: req.user.roles ?? [] });
  return uploadAvatarHandler.handle(command).then(r => res.json(r));
});

module.exports = router;
