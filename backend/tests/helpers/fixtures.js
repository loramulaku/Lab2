/**
 * Test fixtures — create and destroy test data in MySQL + MongoDB.
 *
 * Every helper that creates a row returns the Sequelize instance so the
 * caller can read .id and pass it to cleanup().
 *
 * Naming convention: test records use emails like `test_<timestamp>@test.local`
 * so they are easy to identify and never collide with real data.
 */
const bcrypt = require('bcryptjs');

// ── SQL models ────────────────────────────────────────────────────────────────
const User             = require('../../src/models/sql/User');
const Role             = require('../../src/models/sql/Role');
const UserRole         = require('../../src/models/sql/UserRole');
const CandidateProfile = require('../../src/models/sql/CandidateProfile');
const CandidateSkill   = require('../../src/models/sql/CandidateSkill');
const Skill            = require('../../src/models/sql/Skill');
const Experience       = require('../../src/models/sql/Experience');
const Education        = require('../../src/models/sql/Education');
const RecruiterProfile = require('../../src/models/sql/RecruiterProfile');
const Company          = require('../../src/models/sql/Company');
const Job              = require('../../src/models/sql/Job');
const JobSkill         = require('../../src/models/sql/JobSkill');
const JobCategory      = require('../../src/models/sql/JobCategory');
const Category         = require('../../src/models/sql/Category');
const Bid              = require('../../src/models/sql/Bid');
const Invitation       = require('../../src/models/sql/Invitation');
const Contract         = require('../../src/models/sql/Contract');

// ── MongoDB views ─────────────────────────────────────────────────────────────
const UserProfileView      = require('../../src/models/nosql/UserProfileView');
const CandidateProfileView = require('../../src/models/nosql/CandidateProfileView');
const RecruiterProfileView = require('../../src/models/nosql/RecruiterProfileView');
const JobView              = require('../../src/models/nosql/JobView');
const BidView              = require('../../src/models/nosql/BidView');
const InvitationView       = require('../../src/models/nosql/InvitationView');
const ContractView         = require('../../src/models/nosql/ContractView');

// Low-cost hash only used in tests — never in production
const TEST_PASSWORD_HASH = bcrypt.hashSync('TestPass123!', 1);

// ── CREATE helpers ────────────────────────────────────────────────────────────

function uniqueEmail() {
  return `test_${Date.now()}_${Math.random().toString(36).slice(2)}@test.local`;
}

async function createUser(overrides = {}) {
  return User.create({
    firstName:    overrides.firstName    ?? 'Test',
    lastName:     overrides.lastName     ?? 'User',
    email:        overrides.email        ?? uniqueEmail(),
    passwordHash: overrides.passwordHash ?? TEST_PASSWORD_HASH,
    isActive:     overrides.isActive     ?? true,
    avatarPath:   overrides.avatarPath   ?? null,
  });
}

async function assignRole(userId, roleName) {
  const [role] = await Role.findOrCreate({ where: { name: roleName } });
  await UserRole.create({ userId, roleId: role.id });
  return role;
}

async function createCandidateProfile(userId, overrides = {}) {
  return CandidateProfile.upsert({
    userId,
    headline: overrides.headline ?? 'Software Developer',
    bio:      overrides.bio      ?? 'Test bio',
    location: overrides.location ?? 'Test City',
  });
}

async function createSkill(name = `skill_${Date.now()}`) {
  const [skill] = await Skill.findOrCreate({ where: { name } });
  return skill;
}

async function addCandidateSkill(userId, skillId, level = 'Intermediate') {
  return CandidateSkill.create({ userId, skillId, level });
}

async function createExperience(userId, overrides = {}) {
  return Experience.create({
    userId,
    title:       overrides.title       ?? 'Engineer',
    company:     overrides.company     ?? 'Acme Corp',
    startDate:   overrides.startDate   ?? '2022-01-01',
    endDate:     overrides.endDate     ?? null,
    description: overrides.description ?? null,
  });
}

async function createEducation(userId, overrides = {}) {
  return Education.create({
    userId,
    degree:      overrides.degree      ?? 'BSc Computer Science',
    institution: overrides.institution ?? 'Test University',
    startYear:   overrides.startYear   ?? 2018,
    endYear:     overrides.endYear     ?? 2022,
  });
}

async function createCompany(overrides = {}) {
  return Company.create({
    name:        overrides.name        ?? `TestCo_${Date.now()}`,
    industry:    overrides.industry    ?? 'Technology',
    location:    overrides.location    ?? 'Remote',
    size:        overrides.size        ?? '11-50',
    foundedYear: overrides.foundedYear ?? 2020,
    website:     overrides.website     ?? 'https://testco.example.com',
    description: overrides.description ?? 'A test company',
    logoPath:    overrides.logoPath    ?? null,
  });
}

async function createRecruiterProfile(userId, companyId, overrides = {}) {
  return RecruiterProfile.upsert({
    userId,
    companyId,
    jobTitle:    overrides.jobTitle    ?? 'Head of Talent',
    phone:       overrides.phone       ?? '+1 555 000 0000',
    linkedinUrl: overrides.linkedinUrl ?? 'https://linkedin.com/in/test',
  });
}

async function createJob(companyId, overrides = {}) {
  return Job.create({
    companyId,
    recruiterId:    overrides.recruiterId    ?? null,
    title:          overrides.title          ?? `Test Job ${Date.now()}`,
    description:    overrides.description    ?? 'Test job description',
    employmentType: overrides.employmentType ?? 'full-time',
    workMode:       overrides.workMode       ?? 'remote',
    jobMode:        overrides.jobMode        ?? null,
    status:         overrides.status         ?? 'open',
  });
}

/** A freelancer is a User with the 'candidate' role. */
async function createFreelancer(overrides = {}) {
  const user = await createUser(overrides);
  await assignRole(user.id, 'candidate');
  return user;
}

async function createBid(jobId, freelancerId, overrides = {}) {
  return Bid.create({
    jobId,
    freelancerId,
    price:            overrides.price            ?? 500,
    deliveryTimeDays: overrides.deliveryTimeDays ?? 7,
    message:          overrides.message          ?? 'Test bid',
    status:           overrides.status           ?? 'pending',
    createdAt:        new Date(),
  });
}

async function createInvitation(companyId, freelancerId, jobId, overrides = {}) {
  const status = overrides.status ?? 'pending';
  return Invitation.create({
    companyId,
    freelancerId,
    jobId,
    title:            overrides.title            ?? 'Test offer',
    message:          overrides.message          ?? 'Come work with us',
    priceOffer:       overrides.priceOffer       ?? 800,
    deliveryTimeDays: overrides.deliveryTimeDays ?? 10,
    status,
    activeKey:        status === 'pending' ? `${jobId}:${freelancerId}` : null,
    expiresAt:        overrides.expiresAt        ?? null,
    createdAt:        new Date(),
  });
}

async function createCategory(name = `cat_${Date.now()}`) {
  const [cat] = await Category.findOrCreate({ where: { name } });
  return cat;
}

// ── CLEANUP helpers ───────────────────────────────────────────────────────────

async function cleanupUser(userId) {
  if (!userId) return;
  await CandidateSkill.destroy({ where: { userId } });
  await Experience.destroy({ where: { userId } });
  await Education.destroy({ where: { userId } });
  await CandidateProfile.destroy({ where: { userId } });
  const profile = await RecruiterProfile.findOne({ where: { userId } });
  if (profile) {
    const companyId = profile.companyId;
    await profile.destroy();
    if (companyId) {
      await JobSkill.destroy({ where: {} }); // broad — jobs are cleaned separately
      await Company.destroy({ where: { id: companyId } });
    }
  }
  await UserRole.destroy({ where: { userId } });
  await User.destroy({ where: { id: userId } });
  // MongoDB views
  await CandidateProfileView.findByIdAndDelete(userId);
  await RecruiterProfileView.findByIdAndDelete(userId);
  await UserProfileView.findByIdAndDelete(userId);
}

async function cleanupHiring(jobId) {
  if (!jobId) return;
  const contracts = await Contract.findAll({ where: { jobId }, attributes: ['id'] });
  const bids      = await Bid.findAll({ where: { jobId }, attributes: ['id'] });
  const invites   = await Invitation.findAll({ where: { jobId }, attributes: ['id'] });

  await Contract.destroy({ where: { jobId } });
  await Bid.destroy({ where: { jobId } });
  await Invitation.destroy({ where: { jobId } });

  await Promise.all([
    ...contracts.map(c => ContractView.findByIdAndDelete(c.id)),
    ...bids.map(b => BidView.findByIdAndDelete(b.id)),
    ...invites.map(i => InvitationView.findByIdAndDelete(i.id)),
  ]);
}

async function cleanupJob(jobId) {
  if (!jobId) return;
  await cleanupHiring(jobId);
  await JobSkill.destroy({ where: { jobId } });
  await JobCategory.destroy({ where: { jobId } });
  await Job.destroy({ where: { id: jobId } });
  await JobView.findByIdAndDelete(jobId);
}

async function cleanupCompany(companyId) {
  if (!companyId) return;
  await Company.destroy({ where: { id: companyId } });
}

module.exports = {
  uniqueEmail,
  createUser,
  assignRole,
  createCandidateProfile,
  createSkill,
  addCandidateSkill,
  createExperience,
  createEducation,
  createCompany,
  createRecruiterProfile,
  createJob,
  createCategory,
  createFreelancer,
  createBid,
  createInvitation,
  cleanupUser,
  cleanupJob,
  cleanupHiring,
  cleanupCompany,
};
