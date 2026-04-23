/**
 * userSync — CQRS read-side projection for Users.
 *
 * Called after every MySQL write that changes a User's profile, roles,
 * skills, or company association.
 * Builds a denormalized MongoDB UserProfile document so the read side
 * can return a rich profile in a single document lookup.
 *
 * Flow:
 *   MySQL write (User / UserRoles / CandidateProfile / RecruiterProfile / CandidateSkills)
 *     └─► syncUser(userId)
 *           ├─ SELECT User + Roles + Profile + Company + Skills  (MySQL)
 *           └─ UserProfile.findOneAndUpdate({ userId }, $set, { upsert: true })  (MongoDB)
 */

const { Op }          = require('sequelize');
const User            = require('../models/sql/User');
const Role            = require('../models/sql/Role');
const UserRole        = require('../models/sql/UserRole');
const FailedSync      = require('../models/sql/FailedSync');
const userProfileRepo = require('../repositories/mongodb/userProfile.repo');

/**
 * Build and upsert the MongoDB UserProfileView for one user.
 * Stores core identity + roles + avatarPath.
 * Candidate-specific data lives in CandidateProfileView (see candidateSync).
 * Recruiter-specific data lives in RecruiterProfileView (see recruiterSync).
 *
 * @param {number} userId
 * @returns {Promise<void>}
 */
async function syncUser(userId) {
  // 1. Core user row
  const user = await User.findByPk(userId);
  if (!user) {
    await userProfileRepo.delete(userId);
    return;
  }

  // 2. Roles → flat name array
  const userRoles = await UserRole.findAll({ where: { userId } });
  let roles = [];
  if (userRoles.length) {
    const roleIds  = userRoles.map(ur => ur.roleId);
    const roleRows = await Role.findAll({ where: { id: { [Op.in]: roleIds } } });
    roles = roleRows.map(r => r.name);
  }

  // 3. Upsert MongoDB projection  (_id = MySQL user.id)
  await userProfileRepo.upsert({
    id:         user.id,
    firstName:  user.firstName,
    lastName:   user.lastName,
    email:      user.email,
    isActive:   user.isActive,
    avatarPath: user.avatarPath ?? null,
    roles,
  });

  // Sync succeeded — clear any previous failure record
  await FailedSync.destroy({ where: { entityType: 'user', entityId: userId } });
}

/**
 * Fire-and-forget wrapper used inside handlers/controllers.
 * On failure, logs the error to the FailedSyncs table so it can be retried.
 * On success, the FailedSyncs record is cleared inside syncUser().
 *
 * @param {number} userId
 */
function syncUserSafe(userId) {
  syncUser(userId).catch(async (err) => {
    console.error(`[userSync] Failed to sync userId=${userId}:`, err.message);
    try {
      const [record, created] = await FailedSync.findOrCreate({
        where: { entityType: 'user', entityId: userId },
        defaults: {
          entityType:      'user',
          entityId:        userId,
          errorMessage:    err.message,
          attempts:        1,
          lastAttemptedAt: new Date(),
          createdAt:       new Date(),
        },
      });
      if (!created) {
        // Record already existed — increment attempts
        await record.update({
          errorMessage:    err.message,
          attempts:        record.attempts + 1,
          lastAttemptedAt: new Date(),
          resolvedAt:      null,
        });
      }
    } catch (dbErr) {
      console.error('[userSync] Could not write to FailedSyncs:', dbErr.message);
    }
  });
}

module.exports = { syncUser, syncUserSafe };
