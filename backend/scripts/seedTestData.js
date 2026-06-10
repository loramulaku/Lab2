/**
 * Seed 3 candidates + 3 recruiters with full profiles.
 * Run: node backend/scripts/seedTestData.js
 */
'use strict';

require('dotenv').config();

const axios = require('axios');
const { sequelize }    = require('../src/config/mysql');
const Subscription     = require('../src/models/sql/Subscription');
const CandidateProfile = require('../src/models/sql/CandidateProfile');
const User             = require('../src/models/sql/User');

const BASE = 'http://localhost:3001/api';
const PW   = 'Seeker@1234';
const SEED_PLAN_ID = 3; // Mega plan — 20 job slots

const CANDIDATES = [
  {
    firstName: 'Alban', lastName: 'Hoxha',
    email: 'alban.hoxha@seeker.test',
    headline: 'Full-Stack Developer', location: 'Prishtina, Kosovo',
    bio: 'Passionate full-stack developer with 4 years of experience building scalable web apps.',
    phone: '+38344100001', yearsExperience: 4, willingToRelocate: true,
    skills: [
      { name: 'React',       level: 'Advanced' },
      { name: 'Node.js',     level: 'Advanced' },
      { name: 'PostgreSQL',  level: 'Intermediate' },
    ],
    experiences: [
      { title: 'Frontend Developer', company: 'SoftKos', startDate: '2021-03-01', endDate: '2023-06-30', description: 'Built React dashboards for enterprise clients.' },
      { title: 'Junior Developer',   company: 'TechKS',  startDate: '2020-01-01', endDate: '2021-02-28', description: 'Maintained legacy PHP applications.' },
    ],
    educations: [
      { degree: 'B.Sc. Computer Science', institution: 'University of Prishtina', startYear: 2016, endYear: 2020 },
    ],
  },
  {
    firstName: 'Erisa', lastName: 'Kelmendi',
    email: 'erisa.kelmendi@seeker.test',
    headline: 'UX/UI Designer & Frontend Dev', location: 'Prizren, Kosovo',
    bio: 'Creative designer turned developer. I bridge the gap between beautiful interfaces and solid code.',
    phone: '+38344100002', yearsExperience: 3, willingToRelocate: false,
    skills: [
      { name: 'Figma',       level: 'Expert' },
      { name: 'TypeScript',  level: 'Intermediate' },
      { name: 'Tailwind CSS',level: 'Advanced' },
    ],
    experiences: [
      { title: 'UI/UX Designer', company: 'Creative Hub', startDate: '2022-01-01', endDate: null, description: 'Design systems and component libraries for SaaS products.' },
    ],
    educations: [
      { degree: 'B.A. Graphic Design', institution: 'AAB College', startYear: 2018, endYear: 2022 },
    ],
  },
  {
    firstName: 'Drita', lastName: 'Maloku',
    email: 'drita.maloku@seeker.test',
    headline: 'Backend Engineer & DevOps', location: 'Peja, Kosovo',
    bio: 'Backend engineer specialising in microservices, Docker, and cloud infrastructure.',
    phone: '+38344100003', yearsExperience: 5, willingToRelocate: true,
    skills: [
      { name: 'Python',     level: 'Expert' },
      { name: 'Docker',     level: 'Advanced' },
      { name: 'AWS',        level: 'Intermediate' },
    ],
    experiences: [
      { title: 'DevOps Engineer',   company: 'CloudKS',  startDate: '2021-06-01', endDate: null,         description: 'Managed CI/CD pipelines and AWS infrastructure.' },
      { title: 'Backend Developer', company: 'DataPlex', startDate: '2019-01-01', endDate: '2021-05-31', description: 'Built Django REST APIs for analytics platform.' },
    ],
    educations: [
      { degree: 'M.Sc. Software Engineering', institution: 'University of Mitrovica', startYear: 2017, endYear: 2019 },
    ],
  },
];

const RECRUITERS = [
  {
    firstName: 'Granit', lastName: 'Berisha',
    email: 'granit.berisha@seeker.test',
    company: {
      companyName: 'InnoTech Kosovo', industry: 'Software Development',
      size: '11-50', location: 'Prishtina, Kosovo',
      description: 'Building innovative software solutions for the Balkans market since 2018.',
    },
    pipeline: ['CV Review', 'Technical Interview', 'HR Interview'],
    job: {
      title: 'Senior React Developer',
      description: 'We are looking for an experienced React developer to join our growing team (Prishtina, Kosovo — hybrid). You will work on customer-facing applications using React, TypeScript, and Node.js.',
      employmentType: 'full-time', workMode: 'hybrid', experienceLevel: 'senior',
      budgetMin: 2200, budgetMax: 2800,
    },
  },
  {
    firstName: 'Flaka', lastName: 'Gashi',
    email: 'flaka.gashi@seeker.test',
    company: {
      companyName: 'DigiSolutions SH.P.K.', industry: 'Digital Marketing',
      size: '51-200', location: 'Prizren, Kosovo',
      description: 'Full-service digital agency specialising in web, mobile, and marketing automation.',
    },
    pipeline: ['Portfolio Review', 'Design Test', 'Final Interview'],
    job: {
      title: 'UI/UX Designer',
      description: 'We need a talented UI/UX designer to redesign our client portal and mobile app (Prizren, Kosovo — on-site). Figma proficiency required.',
      employmentType: 'full-time', workMode: 'on-site', experienceLevel: 'mid',
      budgetMin: 1600, budgetMax: 2000,
    },
  },
  {
    firstName: 'Artan', lastName: 'Osmani',
    email: 'artan.osmani@seeker.test',
    company: {
      companyName: 'CloudBase Solutions', industry: 'Cloud Computing',
      size: '11-50', location: 'Peja, Kosovo',
      description: 'Helping businesses migrate and scale on cloud infrastructure.',
    },
    pipeline: ['Technical Screening', 'System Design Interview', 'Offer'],
    job: {
      title: 'Backend Python Developer',
      description: 'Seeking a Python developer to build and maintain our microservices architecture (Remote). Experience with Docker and AWS is a big plus.',
      employmentType: 'full-time', workMode: 'remote', experienceLevel: 'senior',
      budgetMin: 2500, budgetMax: 3200,
    },
  },
];

async function register(firstName, lastName, email, role) {
  try {
    const res = await axios.post(`${BASE}/users/register`, { firstName, lastName, email, password: PW, role });
    return res.data;
  } catch (err) {
    if (err?.response?.data?.message === 'Email already registered') return null; // idempotent
    throw err;
  }
}

async function login(email) {
  const res = await axios.post(`${BASE}/users/login`, { email, password: PW });
  return res.data.token;
}

function auth(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

async function setupCandidate(data) {
  console.log(`\n👤 Candidate: ${data.firstName} ${data.lastName}`);
  await register(data.firstName, data.lastName, data.email, 'candidate');
  const token = await login(data.email);
  const cfg   = auth(token);

  // Profile
  await axios.put(`${BASE}/candidate/profile`, {
    firstName: data.firstName, lastName: data.lastName,
    headline: data.headline, location: data.location,
    bio: data.bio, phone: data.phone,
    yearsExperience: data.yearsExperience,
    willingToRelocate: data.willingToRelocate,
  }, cfg);
  console.log(`  ✓ Profile saved`);

  // Skills (skip duplicates)
  let skillsAdded = 0;
  for (const s of data.skills) {
    try { await axios.post(`${BASE}/candidate/skills`, s, cfg); skillsAdded++; } catch { /* already exists */ }
  }
  console.log(`  ✓ ${skillsAdded} skills added`);

  // Experience (skip duplicates — just add all fresh; duplicates are fine for test data)
  let expAdded = 0;
  for (const e of data.experiences) {
    try { await axios.post(`${BASE}/candidate/experiences`, e, cfg); expAdded++; } catch { /* skip */ }
  }
  console.log(`  ✓ ${expAdded} experiences added`);

  // Education (skip duplicates)
  let eduAdded = 0;
  for (const e of data.educations) {
    try { await axios.post(`${BASE}/candidate/educations`, e, cfg); eduAdded++; } catch { /* skip */ }
  }
  console.log(`  ✓ ${eduAdded} education entries added`);

  // Set a placeholder CV path so the candidate can apply to jobs
  const user = await User.findOne({ where: { email: data.email } });
  if (user) {
    await CandidateProfile.upsert({ userId: user.id, cvPath: `/uploads/cvs/seed_cv_${user.id}.pdf` });
    console.log(`  ✓ CV placeholder set`);
  }

  return token;
}

async function setupRecruiter(data) {
  console.log(`\n🏢 Recruiter: ${data.firstName} ${data.lastName}`);
  await register(data.firstName, data.lastName, data.email, 'recruiter');
  const token = await login(data.email);
  const cfg   = auth(token);

  // Company setup
  const compRes = await axios.post(`${BASE}/recruiter/setup`, data.company, cfg);
  const companyId = compRes.data.companyId ?? compRes.data.id;
  console.log(`  ✓ Company "${data.company.companyName}" created (id=${companyId ?? '?'})`);

  // Grant test subscription directly in DB (skip if already active)
  if (companyId) {
    const existing = await Subscription.findOne({ where: { companyId, status: 'active' } });
    if (!existing) {
      await Subscription.create({
        companyId,
        planId: SEED_PLAN_ID,
        stripeSubscriptionId: `seed_test_${companyId}`,
        status: 'active',
        currentPeriodEnd: new Date('2030-12-31'),
        cancelAtPeriodEnd: false,
      });
      console.log(`  ✓ Subscription granted (plan=Mega)`);
    } else {
      console.log(`  ℹ Subscription already exists — skipping`);
    }
  }

  // Pipeline (skip if already exists)
  const stages = data.pipeline.map((name, i) => ({
    name,
    hasCalendar: i === 1,
  }));
  try {
    await axios.post(`${BASE}/pipeline`, { stages }, cfg);
    console.log(`  ✓ Pipeline created: Application → ${data.pipeline.join(' → ')}`);
  } catch (err) {
    if (err?.response?.data?.code === 'PIPELINE_EXISTS') {
      console.log(`  ℹ Pipeline already exists — skipping`);
    } else throw err;
  }

  // Job
  const jobRes = await axios.post(`${BASE}/jobs`, {
    title:           data.job.title,
    description:     data.job.description,
    employmentType:  data.job.employmentType,
    workMode:        data.job.workMode,
    experienceLevel: data.job.experienceLevel,
    budgetMin:       data.job.budgetMin,
    budgetMax:       data.job.budgetMax,
    status:          'open',
  }, cfg);
  const jobId = jobRes.data.id ?? jobRes.data.job?.id;
  console.log(`  ✓ Job "${data.job.title}" posted (id=${jobId})`);

  return { token, jobId };
}

async function applyToJob(candidateToken, jobId, candidateName, jobTitle) {
  const cfg = auth(candidateToken);
  try {
    await axios.post(`${BASE}/candidate/applications`, { jobId }, cfg);
    console.log(`  ✓ ${candidateName} applied to "${jobTitle}"`);
  } catch (err) {
    const msg = err?.response?.data?.message ?? err.message;
    console.log(`  ✗ ${candidateName} apply failed: ${msg}`);
  }
}

async function main() {
  console.log('=== Seeding test accounts ===\n');

  // Create candidates
  const candidateTokens = [];
  for (const c of CANDIDATES) {
    const token = await setupCandidate(c);
    candidateTokens.push(token);
  }

  // Create recruiters
  const recruiterData = [];
  for (const r of RECRUITERS) {
    const result = await setupRecruiter(r);
    recruiterData.push(result);
  }

  // Apply: each candidate applies to each recruiter's job
  console.log('\n📨 Submitting applications…');
  for (let ci = 0; ci < CANDIDATES.length; ci++) {
    for (let ri = 0; ri < RECRUITERS.length; ri++) {
      await applyToJob(
        candidateTokens[ci],
        recruiterData[ri].jobId,
        `${CANDIDATES[ci].firstName} ${CANDIDATES[ci].lastName}`,
        RECRUITERS[ri].job.title,
      );
    }
  }

  console.log('\n\n=== CREDENTIALS ===\n');
  console.log('CANDIDATES (role: candidate)\n');
  for (const c of CANDIDATES) {
    console.log(`  ${c.firstName} ${c.lastName}`);
    console.log(`    Email:    ${c.email}`);
    console.log(`    Password: ${PW}`);
    console.log();
  }
  console.log('RECRUITERS (role: recruiter)\n');
  for (const r of RECRUITERS) {
    console.log(`  ${r.firstName} ${r.lastName}  —  ${r.company.companyName}`);
    console.log(`    Email:    ${r.email}`);
    console.log(`    Password: ${PW}`);
    console.log();
  }

  console.log('=== Done ===');
  await sequelize.close();
}

main().catch(async (err) => {
  console.error('\n[FATAL]', err?.response?.data ?? err.message);
  await sequelize.close().catch(() => {});
  process.exit(1);
});
