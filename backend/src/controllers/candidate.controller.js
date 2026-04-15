const { Op }            = require('sequelize');
const User              = require('../models/sql/User');
const CandidateProfile  = require('../models/sql/CandidateProfile');
const CandidateSkill    = require('../models/sql/CandidateSkill');
const Skill             = require('../models/sql/Skill');
const Experience        = require('../models/sql/Experience');
const Education         = require('../models/sql/Education');
const Application       = require('../models/sql/Application');
const { syncUserSafe }  = require('../sync/userSync');

const ALLOWED_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

// ── Full profile GET ──────────────────────────────────────────────────────────
async function getProfile(req, res) {
  const userId = req.user.id;

  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const [profile, candidateSkills, experiences, educations] = await Promise.all([
    CandidateProfile.findOne({ where: { userId } }),
    CandidateSkill.findAll({ where: { userId } }),
    Experience.findAll({ where: { userId }, order: [['start_date', 'DESC']] }),
    Education.findAll({ where: { userId }, order: [['start_year', 'DESC']] }),
  ]);

  // Resolve skill names
  let skills = [];
  if (candidateSkills.length) {
    const skillIds  = candidateSkills.map(cs => cs.skillId);
    const skillRows = await Skill.findAll({ where: { id: { [Op.in]: skillIds } } });
    skills = skillRows.map(s => {
      const cs = candidateSkills.find(c => c.skillId === s.id);
      return { id: cs.id, skillId: s.id, name: s.name, level: cs.level };
    });
  }

  // Application count (graceful fallback)
  let totalApplications = 0;
  try { totalApplications = await Application.count({ where: { userId } }); } catch {}

  return res.json({
    id:         user.id,
    firstName:  user.firstName,
    lastName:   user.lastName,
    email:      user.email,
    avatarPath: user.avatarPath ?? null,
    createdAt:  user.createdAt,
    headline:   profile?.headline ?? null,
    bio:        profile?.bio      ?? null,
    location:   profile?.location ?? null,
    skills,
    experiences,
    educations,
    stats: {
      totalApplications,
      skillsListed:     skills.length,
      workExperiences:  experiences.length,
      educationRecords: educations.length,
    },
  });
}

// ── Profile update ────────────────────────────────────────────────────────────
async function updateProfile(req, res) {
  const userId = req.user.id;
  const { firstName, lastName, headline, bio, location } = req.body;

  await User.update({ firstName, lastName }, { where: { id: userId } });

  await CandidateProfile.upsert({ userId, headline, bio, location });

  syncUserSafe(userId);
  return res.json({ message: 'Profile updated' });
}

// ── Skills ────────────────────────────────────────────────────────────────────
async function addSkill(req, res) {
  const userId = req.user.id;
  const { name, level } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Skill name is required' });
  const safeLevel = ALLOWED_LEVELS.includes(level) ? level : 'Intermediate';

  const [skill] = await Skill.findOrCreate({ where: { name: name.trim() } });
  const existing = await CandidateSkill.findOne({ where: { userId, skillId: skill.id } });
  if (existing) return res.status(409).json({ message: 'Skill already added' });

  const cs = await CandidateSkill.create({ userId, skillId: skill.id, level: safeLevel });
  syncUserSafe(userId);
  return res.status(201).json({ id: cs.id, skillId: skill.id, name: skill.name, level: safeLevel });
}

async function deleteSkill(req, res) {
  const userId = req.user.id;
  const id     = Number(req.params.id);
  const deleted = await CandidateSkill.destroy({ where: { id, userId } });
  if (!deleted) return res.status(404).json({ message: 'Skill not found' });
  syncUserSafe(userId);
  return res.json({ message: 'Skill removed' });
}

// ── Experiences ───────────────────────────────────────────────────────────────
async function addExperience(req, res) {
  const userId = req.user.id;
  const { title, company, startDate, endDate, description } = req.body;
  if (!title || !company || !startDate) {
    return res.status(400).json({ message: 'title, company, startDate are required' });
  }
  const exp = await Experience.create({
    userId, title, company,
    startDate, endDate: endDate || null, description: description || null,
  });
  return res.status(201).json(exp);
}

async function updateExperience(req, res) {
  const userId = req.user.id;
  const id     = Number(req.params.id);
  const { title, company, startDate, endDate, description } = req.body;
  const [count] = await Experience.update(
    { title, company, startDate, endDate: endDate || null, description: description || null },
    { where: { id, userId } }
  );
  if (!count) return res.status(404).json({ message: 'Experience not found' });
  return res.json(await Experience.findByPk(id));
}

async function deleteExperience(req, res) {
  const userId = req.user.id;
  const id     = Number(req.params.id);
  const deleted = await Experience.destroy({ where: { id, userId } });
  if (!deleted) return res.status(404).json({ message: 'Experience not found' });
  return res.json({ message: 'Deleted' });
}

// ── Educations ────────────────────────────────────────────────────────────────
async function addEducation(req, res) {
  const userId = req.user.id;
  const { degree, institution, startYear, endYear } = req.body;
  if (!degree || !institution || !startYear) {
    return res.status(400).json({ message: 'degree, institution, startYear are required' });
  }
  const edu = await Education.create({
    userId, degree, institution,
    startYear: Number(startYear), endYear: endYear ? Number(endYear) : null,
  });
  return res.status(201).json(edu);
}

async function updateEducation(req, res) {
  const userId = req.user.id;
  const id     = Number(req.params.id);
  const { degree, institution, startYear, endYear } = req.body;
  const [count] = await Education.update(
    { degree, institution, startYear: Number(startYear), endYear: endYear ? Number(endYear) : null },
    { where: { id, userId } }
  );
  if (!count) return res.status(404).json({ message: 'Education not found' });
  return res.json(await Education.findByPk(id));
}

async function deleteEducation(req, res) {
  const userId = req.user.id;
  const id     = Number(req.params.id);
  const deleted = await Education.destroy({ where: { id, userId } });
  if (!deleted) return res.status(404).json({ message: 'Education not found' });
  return res.json({ message: 'Deleted' });
}

module.exports = {
  getProfile, updateProfile,
  addSkill, deleteSkill,
  addExperience, updateExperience, deleteExperience,
  addEducation, updateEducation, deleteEducation,
};
