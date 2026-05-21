const Company               = require('../../../models/sql/Company');
const RecruiterProfile      = require('../../../models/sql/RecruiterProfile');
const { syncRecruiterSafe } = require('../../../sync/recruiterSync');

class SetupRecruiterHandler {
  async handle(command) {
    const {
      userId, companyName, industry, location, size, foundedYear,
      website, description, jobTitle, phone, linkedinUrl,
    } = command;

    if (!companyName?.trim()) {
      throw Object.assign(new Error('Company name is required'), { status: 400 });
    }

    const profile = await RecruiterProfile.findOne({ where: { userId } });
    let company;

    if (profile?.companyId) {
      await Company.update(
        { name: companyName, industry, location, size, foundedYear, website, description },
        { where: { id: profile.companyId } }
      );
      company = await Company.findByPk(profile.companyId);
    } else {
      company = await Company.create({ name: companyName, industry, location, size, foundedYear, website, description });
    }

    await RecruiterProfile.upsert({ userId, companyId: company.id, jobTitle, phone, linkedinUrl });
    syncRecruiterSafe(userId);
    return { message: 'Profile saved', companyId: company.id };
  }
}

module.exports = new SetupRecruiterHandler();
