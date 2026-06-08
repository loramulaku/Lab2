const bcrypt        = require('bcryptjs');
const jwt           = require('jsonwebtoken');
const crypto        = require('crypto');
const { Op }        = require('sequelize');
const UserRole          = require('../models/sql/UserRole');
const Role              = require('../models/sql/Role');
const RefreshToken      = require('../models/sql/RefreshToken');
const RecruiterProfile  = require('../models/sql/RecruiterProfile');
const userRepo          = require('../repositories/mysql/user.repo');

const RegisterUserCommand   = require('../application/user/commands/RegisterUser.command');
const GetUserProfileQuery   = require('../application/user/queries/GetUserProfile.query');
const registerUserHandler   = require('../application/user/handlers/RegisterUserHandler');
const getUserProfileHandler = require('../application/user/handlers/GetUserProfileHandler');

const UserDTO    = require('../dtos/user.dto');
const auditLog   = require('../utils/audit');

// ── Helpers ───────────────────────────────────────────────────────────────────

function signAccess(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  });
}

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure:   process.env.NODE_ENV === 'production',
  path:     '/',
};

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', COOKIE_OPTS);
}

async function getRoles(userId) {
  const userRoles = await UserRole.findAll({ where: { userId } });
  if (!userRoles.length) return [];
  const roleIds  = userRoles.map(ur => ur.roleId);
  const roleRows = await Role.findAll({ where: { id: { [Op.in]: roleIds } } });
  return roleRows.map(r => r.name);
}

async function getCompanyId(userId, roles) {
  if (!roles.includes('recruiter')) return undefined;
  const profile = await RecruiterProfile.findOne({ where: { userId } });
  return profile?.companyId ?? undefined;
}

async function createRefreshToken(userId) {
  const token     = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ userId, token, expiresAt });
  return token;
}

// ── Controller ────────────────────────────────────────────────────────────────

const userController = {
  async register(req, res) {
    const user = await registerUserHandler.handle(new RegisterUserCommand(req.body));
    auditLog(req, { action: 'USER_REGISTER', entity: 'User', entityId: user.id });
    return res.status(201).json(user);
  },

  async login(req, res) {
    const { email, password } = req.body;
    const user = await userRepo.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const roles       = await getRoles(user.id);
    const companyId   = await getCompanyId(user.id, roles);
    const accessToken = signAccess({ id: user.id, email: user.email, roles, companyId });
    const refreshRaw  = await createRefreshToken(user.id);

    setRefreshCookie(res, refreshRaw);
    user.roles = roles;
    auditLog(req, { action: 'USER_LOGIN', entity: 'User', entityId: user.id });
    return res.json({ token: accessToken, user: UserDTO.from(user) });
  },

  async refresh(req, res) {
    try {
      const raw = req.cookies?.refreshToken;
      if (!raw) return res.status(401).json({ message: 'No refresh token' });

      const stored = await RefreshToken.findOne({ where: { token: raw } });
      if (!stored) {
        clearRefreshCookie(res);
        return res.status(401).json({ message: 'Refresh token not found' });
      }

      if (stored.expiresAt < new Date()) {
        clearRefreshCookie(res);
        return res.status(401).json({ message: 'Refresh token expired' });
      }

      await stored.destroy();
      const newRefresh  = await createRefreshToken(stored.userId);
      const roles       = await getRoles(stored.userId);
      const companyId   = await getCompanyId(stored.userId, roles);
      const accessToken = signAccess({ id: stored.userId, roles, companyId });

      setRefreshCookie(res, newRefresh);
      return res.json({ token: accessToken });
    } catch (err) {
      console.error('[refresh] Unexpected error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async logout(req, res) {
    try {
      const raw = req.cookies?.refreshToken;
      if (raw) await RefreshToken.destroy({ where: { token: raw } });
      clearRefreshCookie(res);
      return res.json({ message: 'Logged out' });
    } catch (err) {
      console.error('[logout] Error:', err);
      clearRefreshCookie(res);
      return res.json({ message: 'Logged out' });
    }
  },

  async getProfile(req, res) {
    const result = await getUserProfileHandler.handle(new GetUserProfileQuery(req.user.id));
    if (!result) return res.status(404).json({ message: 'User not found' });
    return res.json(UserDTO.from(result));
  },
};

module.exports = userController;
