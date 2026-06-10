const bcrypt                = require('bcryptjs');
const userRepo              = require('../../../repositories/mysql/user.repo');
const Role                  = require('../../../models/sql/Role');
const UserRole              = require('../../../models/sql/UserRole');
const { syncUserSafe }      = require('../../../sync/userSync');
const { syncCandidateSafe } = require('../../../sync/candidateSync');
const { syncRecruiterSafe } = require('../../../sync/recruiterSync');
const UserDTO               = require('../../../dtos/user.dto');

const ALLOWED_ROLES = ['candidate', 'recruiter'];

function validatePassword(pw) {
  if (!pw || pw.length < 8)      return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(pw))         return 'Password must include at least one uppercase letter';
  if (!/[0-9]/.test(pw))         return 'Password must include at least one number';
  if (!/[^A-Za-z0-9]/.test(pw))  return 'Password must include at least one special character';
  return null;
}

class RegisterUserHandler {
  async handle(command) {
    const { firstName, lastName, email, password, role } = command;

    const pwError = validatePassword(password);
    if (pwError) throw Object.assign(new Error(pwError), { status: 422 });

    const existing = await userRepo.findByEmail(email);
    if (existing) throw Object.assign(new Error('Email already registered'), { status: 409 });

    const assignedRole  = ALLOWED_ROLES.includes(role) ? role : 'candidate';
    const passwordHash  = await bcrypt.hash(password, 10);
    const user          = await userRepo.create({ firstName, lastName, email, passwordHash });

    const [roleRow] = await Role.findOrCreate({ where: { name: assignedRole } });
    await UserRole.create({ userId: user.id, roleId: roleRow.id });

    // Sync to UserProfileView + role-specific read model
    syncUserSafe(user.id);
    if (assignedRole === 'candidate')      syncCandidateSafe(user.id);
    else if (assignedRole === 'recruiter') syncRecruiterSafe(user.id);

    user.roles = [assignedRole];
    return UserDTO.from(user);
  }
}

module.exports = new RegisterUserHandler();
