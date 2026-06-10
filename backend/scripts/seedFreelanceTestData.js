'use strict';

require('dotenv').config();

const axios = require('axios');
const { sequelize }    = require('../src/config/mysql');
const Subscription     = require('../src/models/sql/Subscription');
const CandidateProfile = require('../src/models/sql/CandidateProfile');
const User             = require('../src/models/sql/User');
const Contract         = require('../src/models/sql/Contract');

const BASE        = 'http://localhost:3001/api';
const PW          = 'Seeker@1234';
const SEED_PLAN_ID = 3; // Mega

// ── Test accounts ─────────────────────────────────────────────────────────────

const FREELANCERS = [
  {
    // Type A — will be invited by recruiter
    firstName: 'Luan',  lastName: 'Krasniqi',
    email:     'luan.krasniqi@seeker.test',
    headline:  'Senior React & TypeScript Developer',
    location:  'Prishtina, Kosovo',
    bio:       'Senior frontend developer with 6 years building SaaS products with React and TypeScript.',
    phone:     '+38344200001', yearsExperience: 6, willingToRelocate: true,
    skills:    [{ name: 'React', level: 'Expert' }, { name: 'TypeScript', level: 'Advanced' }, { name: 'Node.js', level: 'Intermediate' }],
    experiences: [
      { title: 'Senior Frontend Dev', company: 'TechBalkan', startDate: '2020-01-01', endDate: null, description: 'Led UI development for B2B SaaS.' },
    ],
    educations: [
      { degree: 'B.Sc. Computer Science', institution: 'University of Prishtina', startYear: 2015, endYear: 2019 },
    ],
  },
  {
    // Type B — will submit a bid
    firstName: 'Vjosa', lastName: 'Berisha',
    email:     'vjosa.berisha@seeker.test',
    headline:  'Python & Django Backend Developer',
    location:  'Gjakova, Kosovo',
    bio:       'Backend developer specialising in Python, Django REST Framework, and cloud deployments.',
    phone:     '+38344200002', yearsExperience: 4, willingToRelocate: false,
    skills:    [{ name: 'Python', level: 'Expert' }, { name: 'Django', level: 'Advanced' }, { name: 'PostgreSQL', level: 'Intermediate' }],
    experiences: [
      { title: 'Python Developer', company: 'DataStream', startDate: '2021-03-01', endDate: null, description: 'Built REST APIs and data pipelines.' },
    ],
    educations: [
      { degree: 'B.Sc. Information Technology', institution: 'AAB College', startYear: 2017, endYear: 2021 },
    ],
  },
];

// Jobs to create on top of existing recruiter accounts
const FREELANCE_JOBS = [
  {
    recruiterEmail: 'granit.berisha@seeker.test',
    job: {
      title:           'React UI Specialist (Freelance)',
      description:     'InnoTech Kosovo is looking for a senior React developer to build and maintain custom UI components for our SaaS platform. Full remote, flexible hours.',
      employmentType:  'freelance',
      workMode:        'remote',
      experienceLevel: 'senior',
      budgetMin:       3000,
      budgetMax:       5000,
      jobMode:         'invite',   // Type A: invite-only — recruiter finds and invites
    },
  },
  {
    recruiterEmail: 'flaka.gashi@seeker.test',
    job: {
      title:           'Python Backend Developer (Freelance)',
      description:     'DigiSolutions needs a Python/Django developer to build REST APIs for our new mobile app. This is a 3-month contract, fully remote.',
      employmentType:  'freelance',
      workMode:        'remote',
      experienceLevel: 'mid',
      budgetMin:       2000,
      budgetMax:       3500,
      jobMode:         'public',  // Type B: open bidding — freelancers discover and bid
    },
  },
];

// ── HTTP helpers ──────────────────────────────────────────────────────────────

async function register(firstName, lastName, email, role) {
  try {
    const res = await axios.post(`${BASE}/users/register`, { firstName, lastName, email, password: PW, role });
    return res.data;
  } catch (err) {
    if (err?.response?.data?.message === 'Email already registered') return null;
    throw err;
  }
}

async function login(email) {
  const res = await axios.post(`${BASE}/users/login`, { email, password: PW });
  return { token: res.data.token, userId: res.data.user.id };
}

function auth(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

// ── Setup helpers ─────────────────────────────────────────────────────────────

async function setupFreelancer(data) {
  console.log(`\n👤 Freelancer: ${data.firstName} ${data.lastName}`);
  await register(data.firstName, data.lastName, data.email, 'candidate');
  const { token, userId } = await login(data.email);
  const cfg = auth(token);

  // Profile
  await axios.put(`${BASE}/candidate/profile`, {
    firstName: data.firstName, lastName: data.lastName,
    headline: data.headline, location: data.location,
    bio: data.bio, phone: data.phone,
    yearsExperience: data.yearsExperience,
    willingToRelocate: data.willingToRelocate,
  }, cfg);

  // Skills
  for (const s of data.skills) {
    try { await axios.post(`${BASE}/candidate/skills`, s, cfg); } catch { /* skip dup */ }
  }

  // Experience
  for (const e of data.experiences) {
    try { await axios.post(`${BASE}/candidate/experiences`, e, cfg); } catch { /* skip dup */ }
  }

  // Education
  for (const e of data.educations) {
    try { await axios.post(`${BASE}/candidate/educations`, e, cfg); } catch { /* skip dup */ }
  }

  // CV placeholder (required for applications; also good for freelancers)
  await CandidateProfile.upsert({ userId, cvPath: `/uploads/cvs/seed_cv_${userId}.pdf` });

  // Enable freelance mode
  try {
    await axios.put(`${BASE}/candidate/freelance`, { active: true }, cfg);
    console.log(`  ✓ Profile + freelance mode enabled`);
  } catch (err) {
    console.log(`  ⚠ Freelance mode: ${err?.response?.data?.message ?? err.message}`);
  }

  return { token, userId };
}

async function createFreelanceJob(recruiterEmail, jobData) {
  const { token } = await login(recruiterEmail);
  const cfg = auth(token);

  // Ensure subscription
  const profileRes = await axios.get(`${BASE}/recruiter/profile`, cfg);
  const companyId  = profileRes.data?.company?.id ?? null;
  if (companyId) {
    const existing = await Subscription.findOne({ where: { companyId, status: 'active' } });
    if (!existing) {
      await Subscription.create({
        companyId, planId: SEED_PLAN_ID,
        stripeSubscriptionId: `seed_test_${companyId}`,
        status: 'active', currentPeriodEnd: new Date('2030-12-31'), cancelAtPeriodEnd: false,
      });
    }
  }

  const jobRes = await axios.post(`${BASE}/jobs`, { ...jobData, status: 'open' }, cfg);
  const jobId  = jobRes.data.id ?? jobRes.data.job?.id;
  console.log(`  ✓ Job "${jobData.title}" created (id=${jobId}, mode=${jobData.jobMode})`);
  return { token, jobId };
}

// ── FLOW A — Invitation ───────────────────────────────────────────────────────

async function runFlowA(luanToken, luanUserId, granit) {
  console.log('\n\n══════════════════════════════════════════');
  console.log('  TYPE A — INVITATION FLOW');
  console.log('══════════════════════════════════════════');

  // Step 1 — Recruiter sends invitation to freelancer
  console.log('\nStep 1: Recruiter (Granit) sends invitation to Luan…');
  const invRes = await axios.post(`${BASE}/invitations`, {
    freelancerId:     luanUserId,
    jobId:            granit.jobId,
    title:            'React UI Specialist — Invitation',
    message:          'Hi Luan, we noticed your React expertise and would love to work with you on our new SaaS platform UI.',
    priceOffer:       4000,
    deliveryTimeDays: 45,
  }, auth(granit.token));
  const invId = invRes.data.id;
  console.log(`  ✓ Invitation sent (id=${invId}, status=${invRes.data.status})`);

  // Step 2 — Freelancer receives notification + confirms invitation
  console.log('\nStep 2: Freelancer (Luan) confirms invitation…');
  const confirmRes = await axios.post(`${BASE}/invitations/${invId}/confirm`, {}, auth(luanToken));
  console.log(`  ✓ Invitation confirmed (status=${confirmRes.data.status})`);

  // Step 3 — Recruiter sees confirmed invite, creates contract
  console.log('\nStep 3: Recruiter (Granit) creates contract for Luan…');
  const contractRes = await axios.post(`${BASE}/contracts`, {
    source:       'invitation',
    invitationId: invId,
    agreedPrice:  4200,
    startDate:    '2026-07-01',
    endDate:      '2026-10-01',
  }, auth(granit.token));
  const contractId = contractRes.data.id;
  console.log(`  ✓ Contract created (id=${contractId}, status=${contractRes.data.status})`);

  // Step 4 — Freelancer receives contract_offer notification + accepts
  console.log('\nStep 4: Freelancer (Luan) accepts contract…');
  const approveRes = await axios.post(`${BASE}/contracts/${contractId}/approve`, {}, auth(luanToken));
  console.log(`  ✓ Contract approved (status=${approveRes.data.status ?? approveRes.data.contract?.status})`);

  // Step 5 — Verify directly in MySQL: Luan has an active invitation contract
  console.log('\nStep 5: Verifying Luan in Hired → Freelance (MySQL check)…');
  const row = await Contract.findOne({ where: { freelancerId: luanUserId, source: 'invitation', status: 'active' } });
  if (row) {
    console.log(`  ✓ Luan (userId=${luanUserId}) has active invitation contract (id=${row.id})`);
  } else {
    console.log(`  ✗ No active invitation contract found for Luan (userId=${luanUserId})`);
  }

  return { success: !!row };
}

// ── FLOW B — Bid ──────────────────────────────────────────────────────────────

async function runFlowB(vjosaToken, vjosaUserId, flaka) {
  console.log('\n\n══════════════════════════════════════════');
  console.log('  TYPE B — BID FLOW');
  console.log('══════════════════════════════════════════');

  // Step 1 — Freelancer submits bid on public job
  console.log('\nStep 1: Freelancer (Vjosa) submits bid…');
  const bidRes = await axios.post(`${BASE}/jobs/${flaka.jobId}/bids`, {
    price:            2800,
    deliveryTimeDays: 60,
    message:          'Hi, I\'m a Python/Django specialist with 4 years of REST API experience. I can deliver a well-tested, documented API within the timeline.',
    coverLetter:      'I have built similar mobile backend APIs for 3 SaaS companies. My stack: Django, DRF, PostgreSQL, Docker. Let\'s discuss the project scope.',
  }, auth(vjosaToken));
  const bidId = bidRes.data.id;
  console.log(`  ✓ Bid submitted (id=${bidId}, price=$${bidRes.data.price}, status=${bidRes.data.status})`);

  // Step 2 — Recruiter opens BidsReceived, picks Vjosa, creates contract
  console.log('\nStep 2: Recruiter (Flaka) creates contract for Vjosa…');
  const contractRes = await axios.post(`${BASE}/contracts`, {
    source:    'bid',
    bidId,
    agreedPrice: 2800,
    startDate:   '2026-07-15',
    endDate:     '2026-10-15',
  }, auth(flaka.token));
  const contractId = contractRes.data.id;
  console.log(`  ✓ Contract created (id=${contractId}, status=${contractRes.data.status})`);

  // Step 3 — Freelancer receives contract_offer notification + accepts
  console.log('\nStep 3: Freelancer (Vjosa) accepts contract…');
  const approveRes = await axios.post(`${BASE}/contracts/${contractId}/approve`, {}, auth(vjosaToken));
  console.log(`  ✓ Contract approved (status=${approveRes.data.status ?? approveRes.data.contract?.status})`);

  // Step 4 — Verify directly in MySQL: Vjosa has an active bid contract
  console.log('\nStep 4: Verifying Vjosa in Hired → Freelance (MySQL check)…');
  const row = await Contract.findOne({ where: { freelancerId: vjosaUserId, source: 'bid', status: 'active' } });
  if (row) {
    console.log(`  ✓ Vjosa (userId=${vjosaUserId}) has active bid contract (id=${row.id})`);
  } else {
    console.log(`  ✗ No active bid contract found for Vjosa (userId=${vjosaUserId})`);
  }

  return { success: !!row };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Seeding + Testing Freelancer Flows ===\n');

  // 1. Create freelancer accounts
  const luan  = await setupFreelancer(FREELANCERS[0]);
  const vjosa = await setupFreelancer(FREELANCERS[1]);

  // 2. Create freelance jobs on existing recruiter accounts
  console.log('\n📋 Creating freelance jobs…\n');
  console.log(`🏢 Recruiter: Granit Berisha`);
  const granit = await createFreelanceJob(FREELANCE_JOBS[0].recruiterEmail, FREELANCE_JOBS[0].job);
  const { token: granitToken } = await login('granit.berisha@seeker.test');
  granit.token = granitToken;

  console.log(`\n🏢 Recruiter: Flaka Gashi`);
  const flaka = await createFreelanceJob(FREELANCE_JOBS[1].recruiterEmail, FREELANCE_JOBS[1].job);
  const { token: flakaToken } = await login('flaka.gashi@seeker.test');
  flaka.token = flakaToken;

  // 3. Run both flows end-to-end
  const resultA = await runFlowA(luan.token, luan.userId, granit);
  const resultB = await runFlowB(vjosa.token, vjosa.userId, flaka);

  // 4. Print credentials + results
  console.log('\n\n══════════════════════════════════════════');
  console.log('  CREDENTIALS');
  console.log('══════════════════════════════════════════\n');

  console.log('FREELANCERS (role: candidate, freelance enabled)\n');
  console.log(`  Luan Krasniqi — Type A (Invitation)`);
  console.log(`    Email:    luan.krasniqi@seeker.test`);
  console.log(`    Password: ${PW}\n`);
  console.log(`  Vjosa Berisha — Type B (Bid)`);
  console.log(`    Email:    vjosa.berisha@seeker.test`);
  console.log(`    Password: ${PW}\n`);

  console.log('RECRUITERS (existing accounts)\n');
  console.log(`  Granit Berisha  —  InnoTech Kosovo (invite-mode job)`);
  console.log(`    Email:    granit.berisha@seeker.test`);
  console.log(`    Password: ${PW}\n`);
  console.log(`  Flaka Gashi  —  DigiSolutions SH.P.K. (public bid job)`);
  console.log(`    Email:    flaka.gashi@seeker.test`);
  console.log(`    Password: ${PW}\n`);

  console.log('══════════════════════════════════════════');
  console.log('  FLOW RESULTS');
  console.log('══════════════════════════════════════════');
  console.log(`  Type A (Invitation): ${resultA.success ? '✓ PASSED' : '✗ FAILED'}`);
  console.log(`  Type B (Bid):        ${resultB.success ? '✓ PASSED' : '✗ FAILED'}`);
  console.log('══════════════════════════════════════════\n');

  if (!resultA.success || !resultB.success) {
    process.exitCode = 1;
  }

  await sequelize.close();
  console.log('=== Done ===');
}

main().catch(async (err) => {
  console.error('\n[FATAL]', err?.response?.data ?? err.message);
  if (err?.response?.data) console.error('Response status:', err.response.status);
  await sequelize.close().catch(() => {});
  process.exit(1);
});
