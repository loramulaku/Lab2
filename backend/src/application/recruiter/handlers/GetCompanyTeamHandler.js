const RecruiterProfile = require('../../../models/sql/RecruiterProfile');
const User             = require('../../../models/sql/User');

class GetCompanyTeamHandler {
  async handle(query) {
    const profiles = await RecruiterProfile.findAll({
      where: { companyId: query.companyId },
      include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email', 'avatarPath', 'isActive'] }],
    });

    return profiles.map(p => ({
      userId:     p.userId,
      firstName:  p.User?.firstName  ?? null,
      lastName:   p.User?.lastName   ?? null,
      email:      p.User?.email      ?? null,
      avatarPath: p.User?.avatarPath ?? null,
      isActive:   p.User?.isActive   ?? true,
      jobTitle:   p.jobTitle         ?? null,
      phone:      p.phone            ?? null,
    }));
  }
}

module.exports = new GetCompanyTeamHandler();
