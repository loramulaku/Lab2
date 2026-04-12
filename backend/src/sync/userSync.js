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

const { Op }            = require('sequelize');
const User              = require('../models/sql/User');
const Role              = require('../models/sql/Role');
const UserRole          = require('../models/sql/UserRole');
const CandidateProfile  = require('../models/sql/CandidateProfile');
const RecruiterProfile  = require('../models/sql/RecruiterProfile');
const Company           = require('../models/sql/Company');
const CandidateSkill    = require('../models/sql/CandidateSkill');
const Skill             = require('../models/sql/Skill');
const userProfileRepo   = require('../repositories/mongodb/userProfile.repo');

/**
 * Build and upsert the MongoDB read projection for one user.
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

  // 2. Roles  → flat name array
  const userRoles = await UserRole.findAll({ where: { userId } });
  let roles = [];
  if (userRoles.length) {
    const roleIds  = userRoles.map(ur => ur.roleId);
    const roleRows = await Role.findAll({ where: { id: { [Op.in]: roleIds } } });
    roles = roleRows.map(r => r.name);
  }

  // 3. Candidate profile + skills (if exists)
  const candidateProfile = await CandidateProfile.findOne({ where: { userId } });
  let skills = [];
  if (candidateProfile) {
    const candidateSkills = await CandidateSkill.findAll({ where: { userId } });
    if (candidateSkills.length) {
      const skillIds  = candidateSkills.map(cs => cs.skillId);
      const skillRows = await Skill.findAll({ where: { id: { [Op.in]: skillIds } } });
      // Build { name, level } objects
      skills = skillRows.map(s => {
        const cs = candidateSkills.find(cs => cs.skillId === s.id);
        return { name: s.name, level: cs?.level ?? null };
      });
    }
  }

  // 4. Recruiter profile + company snapshot (if exists)
  const recruiterProfile = await RecruiterProfile.findOne({ where: { userId } });
  let companySnapshot = null;
  if (recruiterProfile?.companyId) {
    const company = await Company.findByPk(recruiterProfile.companyId);
    if (company) {
      companySnapshot = { id: company.id, name: company.name, website: company.website };
    }
  }

  // 5. Upsert MongoDB projection  (_id = MySQL user.id)
  await userProfileRepo.upsert({
    id:        user.id,                        // mapped to _id by the repo
    firstName: user.firstName,
    lastName:  user.lastName,
    email:     user.email,
    isActive:  user.isActive,
    roles,
    // Candidate fields
    headline:  candidateProfile?.headline ?? null,
    bio:       candidateProfile?.bio      ?? null,
    location:  candidateProfile?.location ?? null,
    skills,
    // Recruiter fields
    company:   companySnapshot,
  });
}

/**
 * Fire-and-forget wrapper used inside handlers/controllers.
 *
 * @param {number} userId
 */
function syncUserSafe(userId) {
  syncUser(userId).catch(err =>
    console.error(`[userSync] Failed to sync userId=${userId}:`, err.message)
  );
}

module.exports = { syncUser, syncUserSafe };
