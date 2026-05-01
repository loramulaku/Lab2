const bcrypt           = require('bcryptjs');
const jwt              = require('jsonwebtoken');
const userRepo         = require('../repositories/mysql/user.repo');
const UserRole         = require('../models/sql/UserRole');
const Role             = require('../models/sql/Role');
const { syncUserSafe } = require('../sync/userSync');
const UserDTO          = require('../dtos/user.dto');

const ALLOWED_ROLES = ['admin', 'recruiter', 'candidate'];

const userController = {
  async register(req, res) {
    const { firstName, lastName, email, password, role } = req.body;
    const existing = await userRepo.findByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const roleName = ALLOWED_ROLES.includes(role) ? role : 'candidate';
    const roleRecord = await Role.findOne({ where: { name: roleName } });
    if (!roleRecord) return res.status(500).json({ message: 'Role not seeded in database' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepo.create({ firstName, lastName, email, passwordHash });

    await UserRole.create({ userId: user.id, roleId: roleRecord.id });

    syncUserSafe(user.id);

    return res.status(201).json(UserDTO.from(user));
  },

  async login(req, res) {
    const { email, password } = req.body;
    const result = await userRepo.findByEmailWithRoles(email);
    if (!result) return res.status(401).json({ message: 'Invalid credentials' });

    const { user, roles } = result;
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, roles },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    return res.json({ token, user: UserDTO.from(user) });
  },

  async getProfile(req, res) {
    const user = await userRepo.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(UserDTO.from(user));
  },
};

module.exports = userController;
