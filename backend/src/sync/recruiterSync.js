/**
 * recruiterSync — CQRS read-side projection for RecruiterProfiles.
 *
 * Called after every MySQL write that touches a recruiter's data:
 * profile fields, company details, logo, or avatar.
 * Builds a fully denormalised RecruiterProfileView document in MongoDB
 * so recruiter reads never touch MySQL.
 *
 * Flow:
 *   MySQL write (User / RecruiterProfile / Company)
 *     └─► syncRecruiter(userId)
 *           ├─ SELECT all recruiter + company data from MySQL
 *           └─ RecruiterProfileView.findOneAndUpdate({ _id: userId }, $set, { upsert })
 */

const User             = require('../models/sql/User');
const RecruiterProfile = require('../models/sql/RecruiterProfile');
const Company          = require('../models/sql/Company');
const FailedSync       = require('../models/sql/FailedSync');
const recruiterProfileRepo = require('../repositories/mongodb/recruiterProfile.repo');

/**
 * Build and upsert the RecruiterProfileView for one user.
 * @param {number} userId
 */
async function syncRecruiter(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    await recruiterProfileRepo.delete(userId);
    return;
  }

  const profile = await RecruiterProfile.findOne({ where: { userId } });
  const company = profile?.companyId
    ? await Company.findByPk(profile.companyId)
    : null;

  await recruiterProfileRepo.upsert({
    id:          userId,                      // mapped to _id by the repo
    firstName:   user.firstName,
    lastName:    user.lastName,
    email:       user.email,
    avatarPath:  user.avatarPath ?? null,
    jobTitle:    profile?.jobTitle    ?? null,
    phone:       profile?.phone       ?? null,
    linkedinUrl: profile?.linkedinUrl ?? null,
    company: company ? {
      id:          company.id,
      name:        company.name,
      industry:    company.industry    ?? null,
      location:    company.location    ?? null,
      size:        company.size        ?? null,
      foundedYear: company.foundedYear ?? null,
      website:     company.website     ?? null,
      description: company.description ?? null,
      logoPath:    company.logoPath    ?? null,
    } : null,
  });

  // Sync succeeded — clear any prior failure record
  await FailedSync.destroy({ where: { entityType: 'recruiter', entityId: userId } });
}

/**
 * Fire-and-forget wrapper. On failure logs to FailedSyncs for later retry.
 * @param {number} userId
 */
function syncRecruiterSafe(userId) {
  syncRecruiter(userId).catch(async (err) => {
    console.error(`[recruiterSync] Failed to sync userId=${userId}:`, err.message);
    try {
      const [record, created] = await FailedSync.findOrCreate({
        where: { entityType: 'recruiter', entityId: userId },
        defaults: {
          entityType:      'recruiter',
          entityId:        userId,
          errorMessage:    err.message,
          attempts:        1,
          lastAttemptedAt: new Date(),
          createdAt:       new Date(),
        },
      });
      if (!created) {
        await record.update({
          errorMessage:    err.message,
          attempts:        record.attempts + 1,
          lastAttemptedAt: new Date(),
          resolvedAt:      null,
        });
      }
    } catch (dbErr) {
      console.error('[recruiterSync] Could not write to FailedSyncs:', dbErr.message);
    }
  });
}

module.exports = { syncRecruiter, syncRecruiterSafe };
