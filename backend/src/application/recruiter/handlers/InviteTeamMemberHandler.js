const User             = require('../../../models/sql/User');
const Role             = require('../../../models/sql/Role');
const UserRole         = require('../../../models/sql/UserRole');
const RecruiterProfile = require('../../../models/sql/RecruiterProfile');
const { syncRecruiterSafe } = require('../../../sync/recruiterSync');

class InviteTeamMemberHandler {
  async handle(cmd) {
    const user = await User.findOne({ where: { email: cmd.email } });
    if (!user) {
      const err = new Error('No account found with that email. Ask them to register first.');
      err.status = 404;
      throw err;
    }

    // Check if already on this company
    const existing = await RecruiterProfile.findOne({ where: { userId: user.id } });
    if (existing) {
      if (existing.companyId === cmd.companyId) {
        const err = new Error('This person is already a member of your company.');
        err.status = 409;
        throw err;
      }
      const err = new Error('This person already belongs to another company.');
      err.status = 409;
      throw err;
    }

    // Ensure recruiter role
    const [role] = await Role.findOrCreate({ where: { name: 'recruiter' } });
    await UserRole.findOrCreate({ where: { userId: user.id, roleId: role.id } });

    // Create recruiter profile linked to this company
    const profile = await RecruiterProfile.create({
      userId:    user.id,
      companyId: cmd.companyId,
      jobTitle:  cmd.jobTitle ?? 'Recruiter',
    });

    syncRecruiterSafe(user.id);

    return {
      userId:    user.id,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      jobTitle:  profile.jobTitle,
      isActive:  user.isActive,
    };
  }
}

module.exports = new InviteTeamMemberHandler();
