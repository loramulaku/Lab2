const Company               = require('../../../models/sql/Company');
const RecruiterProfile      = require('../../../models/sql/RecruiterProfile');
const { syncRecruiterSafe } = require('../../../sync/recruiterSync');

class UploadLogoHandler {
  async handle(command) {
    const { userId, logoPath } = command;
    const profile = await RecruiterProfile.findOne({ where: { userId } });
    if (profile?.companyId) {
      await Company.update({ logoPath }, { where: { id: profile.companyId } });
      syncRecruiterSafe(userId);
    }
    return { path: logoPath };
  }
}

module.exports = new UploadLogoHandler();
