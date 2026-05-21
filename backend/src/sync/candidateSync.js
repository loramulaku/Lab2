/**
 * candidateSync — CQRS read-side projection for CandidateProfiles.
 *
 * Called after every MySQL write that touches a candidate's data:
 * profile fields, skills, experiences, educations, or avatar.
 * Builds a fully denormalised CandidateProfileView document in MongoDB
 * so candidate reads never touch MySQL.
 *
 * Flow:
 *   MySQL write (User / CandidateProfile / CandidateSkills / Experiences / Educations)
 *     └─► syncCandidate(userId)
 *           ├─ SELECT all candidate data from MySQL
 *           └─ CandidateProfileView.findOneAndUpdate({ _id: userId }, $set, { upsert })
 */

const { Op }           = require('sequelize');
const User             = require('../models/sql/User');
const CandidateProfile = require('../models/sql/CandidateProfile');
const CandidateSkill   = require('../models/sql/CandidateSkill');
const Skill            = require('../models/sql/Skill');
const Experience       = require('../models/sql/Experience');
const Education        = require('../models/sql/Education');
const Application      = require('../models/sql/Application');
const FailedSync       = require('../models/sql/FailedSync');
const candidateProfileRepo = require('../repositories/mongodb/candidateProfile.repo');

/**
 * Build and upsert the CandidateProfileView for one user.
 * @param {number} userId
 */
async function syncCandidate(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    await candidateProfileRepo.delete(userId);
    return;
  }

  const [profile, candidateSkills, experiences, educations] = await Promise.all([
    CandidateProfile.findOne({ where: { userId } }),
    CandidateSkill.findAll({ where: { userId } }),
    Experience.findAll({ where: { userId }, order: [['start_date', 'DESC']] }),
    Education.findAll({ where: { userId }, order: [['start_year', 'DESC']] }),
  ]);

  // Resolve skill names + levels
  let skills = [];
  if (candidateSkills.length) {
    const skillIds  = candidateSkills.map(cs => cs.skillId);
    const skillRows = await Skill.findAll({ where: { id: { [Op.in]: skillIds } } });
    skills = skillRows.map(s => {
      const cs = candidateSkills.find(c => c.skillId === s.id);
      return { skillId: s.id, name: s.name, level: cs?.level ?? null };
    });
  }

  // Application count (graceful fallback if table not yet populated)
  let totalApplications = 0;
  try { totalApplications = await Application.count({ where: { userId } }); } catch {}

  await candidateProfileRepo.upsert({
    id:         userId,                       // mapped to _id by the repo
    firstName:  user.firstName,
    lastName:   user.lastName,
    email:      user.email,
    avatarPath: user.avatarPath ?? null,
    headline:   profile?.headline  ?? null,
    bio:        profile?.bio       ?? null,
    location:   profile?.location  ?? null,
    skills,
    experiences: experiences.map(e => ({
      id:          e.id,
      title:       e.title,
      company:     e.company,
      startDate:   e.startDate,
      endDate:     e.endDate     ?? null,
      description: e.description ?? null,
    })),
    educations: educations.map(e => ({
      id:          e.id,
      degree:      e.degree,
      institution: e.institution,
      startYear:   e.startYear,
      endYear:     e.endYear ?? null,
    })),
    stats: {
      totalApplications,
      skillsListed:     skills.length,
      workExperiences:  experiences.length,
      educationRecords: educations.length,
    },
  });

  // Sync succeeded — clear any prior failure record
  await FailedSync.destroy({ where: { entityType: 'candidate', entityId: userId } });
}

/**
 * Fire-and-forget wrapper. On failure logs to FailedSyncs for later retry.
 * @param {number} userId
 */
function syncCandidateSafe(userId) {
  syncCandidate(userId).catch(async (err) => {
    console.error(`[candidateSync] Failed to sync userId=${userId}:`, err.message);
    try {
      const [record, created] = await FailedSync.findOrCreate({
        where: { entityType: 'candidate', entityId: userId },
        defaults: {
          entityType:      'candidate',
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
      console.error('[candidateSync] Could not write to FailedSyncs:', dbErr.message);
    }
  });
}

module.exports = { syncCandidate, syncCandidateSafe };
