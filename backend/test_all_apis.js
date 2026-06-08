/**
 * Comprehensive API test — covers every registered route.
 * Creates isolated test accounts, runs all tests, cleans up.
 *
 * Run: node test_all_apis.js
 */

const axios  = require('axios');
require('dotenv').config();
const { Sequelize } = require('sequelize');

const BASE = 'http://localhost:3001/api';
const TAG  = `_apitest_${Date.now()}`;
const PW   = 'TestApi99!';

// ── Console helpers ───────────────────────────────────────────────────────────
const G = '\x1b[32m✅\x1b[0m';
const R = '\x1b[31m❌\x1b[0m';
const W = '\x1b[33m⚠️ \x1b[0m';
const D = '\x1b[2m'; const E = '\x1b[0m';

let passed = 0, failed = 0, warned = 0;
const ok   = (lbl)       => { console.log(`  ${G} ${lbl}`); passed++; };
const fail = (lbl, d='') => { console.log(`  ${R} ${lbl}${d?`  ${D}(${d})${E}`:''}`); failed++; };
const warn = (lbl, d='') => { console.log(`  ${W} ${lbl}${d?`  ${D}(${d})${E}`:''}`); warned++; };
const sect = (t)         => console.log(`\n\x1b[1m${t}\x1b[0m`);

// ── HTTP client (handles cookie-based refresh token) ─────────────────────────
function client(token, cookieJar = {}) {
  const hdrs = {};
  if (token) hdrs['Authorization'] = `Bearer ${token}`;
  const cookieStr = Object.entries(cookieJar).map(([k,v]) => `${k}=${v}`).join('; ');
  if (cookieStr) hdrs['Cookie'] = cookieStr;
  return axios.create({ baseURL: BASE, headers: hdrs, validateStatus: () => true });
}

async function req(method, url, body, token, cookieJar) {
  return client(token, cookieJar)[method](url, body ?? undefined);
}

// Extract Set-Cookie into a plain object
function parseCookies(res) {
  const jar = {};
  (res.headers['set-cookie'] ?? []).forEach(c => {
    const [kv] = c.split(';');
    const [k, v] = kv.split('=');
    jar[k.trim()] = v?.trim() ?? '';
  });
  return jar;
}

// ── DB helpers for cleanup & seeding ─────────────────────────────────────────
const seq = new Sequelize(
  process.env.MYSQL_DB, process.env.MYSQL_USER, process.env.MYSQL_PASS,
  { host: process.env.MYSQL_HOST, port: process.env.MYSQL_PORT || 3306, dialect: 'mysql', logging: false }
);

async function cleanup(emails) {
  sect('🧹 Cleanup');
  try {
    const [users] = await seq.query(
      `SELECT id FROM users WHERE email IN (${emails.map(()=>'?').join(',')})`,
      { replacements: emails }
    );
    const ids = users.map(u => u.id);
    if (!ids.length) { console.log('  nothing to clean'); return; }
    const ph = ids.map(()=>'?').join(',');
    const run = (sql, r=[]) => seq.query(sql, { replacements: r.length ? r : undefined });
    await run(`DELETE FROM notifications     WHERE user_id IN (${ph})`, ids);
    await run(`DELETE FROM pipelinenotes     WHERE application_id IN (SELECT id FROM applications WHERE user_id IN (${ph}))`, ids);
    await run(`DELETE FROM stagehistory      WHERE application_id IN (SELECT id FROM applications WHERE user_id IN (${ph}))`, ids);
    // contracts linked to bids or applications from test users
    await run(`DELETE FROM contracts         WHERE bid_id IN (SELECT id FROM bids WHERE freelancer_id IN (${ph}))`, ids);
    await run(`DELETE FROM contracts         WHERE application_id IN (SELECT id FROM applications WHERE user_id IN (${ph}))`, ids);
    await run(`DELETE FROM invitations       WHERE company_id IN (SELECT id FROM companies WHERE id IN (SELECT company_id FROM recruiterprofiles WHERE user_id IN (${ph}))) OR freelancer_id IN (${ph})`, [...ids,...ids]);
    await run(`DELETE FROM bids              WHERE freelancer_id IN (${ph})`, ids);
    await run(`DELETE FROM applications      WHERE user_id IN (${ph})`, ids);
    await run(`DELETE FROM saved_jobs        WHERE user_id IN (${ph})`, ids);
    await run(`DELETE FROM candidateskills   WHERE user_id IN (${ph})`, ids);
    await run(`DELETE FROM experiences       WHERE user_id IN (${ph})`, ids);
    await run(`DELETE FROM educations        WHERE user_id IN (${ph})`, ids);
    // pipeline stages & pipeline for test company
    await run(`DELETE FROM pipelinestages    WHERE pipeline_id IN (SELECT id FROM pipelines WHERE company_id IN (SELECT id FROM companies WHERE id IN (SELECT company_id FROM recruiterprofiles WHERE user_id IN (${ph}))))`, ids);
    await run(`DELETE FROM pipelines         WHERE company_id IN (SELECT id FROM companies WHERE id IN (SELECT company_id FROM recruiterprofiles WHERE user_id IN (${ph})))`, ids);
    await run(`DELETE FROM jobs              WHERE recruiter_id IN (${ph})`, ids);
    await run(`DELETE FROM subscriptions     WHERE company_id IN (SELECT id FROM companies WHERE id IN (SELECT company_id FROM recruiterprofiles WHERE user_id IN (${ph})))`, ids);
    await run(`DELETE FROM companies         WHERE id IN (SELECT company_id FROM recruiterprofiles WHERE user_id IN (${ph}))`, ids);
    await run(`DELETE FROM recruiterprofiles WHERE user_id IN (${ph})`, ids);
    await run(`DELETE FROM candidateprofiles WHERE user_id IN (${ph})`, ids);
    await run(`DELETE FROM userroles         WHERE user_id IN (${ph})`, ids);
    await run(`DELETE FROM refreshtokens     WHERE user_id IN (${ph})`, ids);
    await run(`DELETE FROM users             WHERE id IN (${ph})`, ids);
    ok('Test data removed');
  } catch(e) { warn('Partial cleanup', e.message); }
  await seq.close();
}

// ═════════════════════════════════════════════════════════════════════════════
async function run() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log(' Comprehensive API Test Suite');
  console.log('══════════════════════════════════════════════════════');

  const recEmail  = `rec${TAG}@test.local`;
  const candEmail = `cand${TAG}@test.local`;

  let recToken, candToken, recId, candId;
  let recCookies = {}, candCookies = {};
  let jobId, jobId2, stdJobId, invJobId, appId, bidId, invId, contractId, pendingContractId, notifId, convId;

  // ═══════════════════════════════════════════════════════════════
  sect('1 · AUTH — /users');
  // ═══════════════════════════════════════════════════════════════

  let r = await req('post', '/users/register', { firstName:'TestRec', lastName:'Api', email:recEmail,  password:PW, role:'recruiter' });
  r.status===201||r.status===200 ? ok('POST /users/register (recruiter)') : fail('POST /users/register (recruiter)', r.data?.message);

  r = await req('post', '/users/register', { firstName:'TestCand', lastName:'Api', email:candEmail, password:PW, role:'candidate' });
  r.status===201||r.status===200 ? ok('POST /users/register (candidate)') : fail('POST /users/register (candidate)', r.data?.message);

  r = await req('post', '/users/login', { email:recEmail, password:PW });
  if (r.status===200) { recToken=r.data.token; recId=r.data.user.id; recCookies=parseCookies(r); ok('POST /users/login (recruiter)'); }
  else fail('POST /users/login (recruiter)', r.data?.message);

  r = await req('post', '/users/login', { email:candEmail, password:PW });
  if (r.status===200) { candToken=r.data.token; candId=r.data.user.id; candCookies=parseCookies(r); ok('POST /users/login (candidate)'); }
  else fail('POST /users/login (candidate)', r.data?.message);

  r = await req('get', '/users/me', null, recToken);
  r.status===200 ? ok('GET /users/me') : fail('GET /users/me', r.data?.message);

  // Refresh token is an HTTP-only cookie — send it back as Cookie header
  r = await req('post', '/users/refresh', null, null, candCookies);
  if (r.status===200) { ok('POST /users/refresh (cookie-based)'); }
  else fail('POST /users/refresh', r.data?.message);

  // ═══════════════════════════════════════════════════════════════
  sect('2 · THEME & CATEGORIES & PLANS');
  // ═══════════════════════════════════════════════════════════════

  r = await req('get', '/theme/active');
  r.status===200||r.status===404 ? ok('GET /theme/active') : fail('GET /theme/active', r.data?.message);

  r = await req('get', '/categories');
  r.status===200 ? ok('GET /categories') : fail('GET /categories', r.data?.message);

  r = await req('get', '/plans', null, recToken);
  r.status===200 ? ok('GET /plans') : fail('GET /plans', r.data?.message);

  // ═══════════════════════════════════════════════════════════════
  sect('3 · RECRUITER SETUP & PROFILE — /recruiter');
  // ═══════════════════════════════════════════════════════════════

  r = await req('post', '/recruiter/setup', { companyName:`TestCo${TAG}`, industry:'Technology' }, recToken);
  if (r.status===200||r.status===201) {
    ok('POST /recruiter/setup');
    const relogin = await req('post', '/users/login', { email:recEmail, password:PW });
    if (relogin.status===200) { recToken=relogin.data.token; recCookies=parseCookies(relogin); ok('Re-login (companyId in JWT)'); }
  } else fail('POST /recruiter/setup', r.data?.message);

  r = await req('get', '/recruiter/profile', null, recToken);
  r.status===200 ? ok('GET /recruiter/profile') : fail('GET /recruiter/profile', r.data?.message);
  const companyId = r.data?.company?.id;

  if (companyId) {
    const end = new Date(Date.now()+30*24*60*60*1000).toISOString().slice(0,19).replace('T',' ');
    await seq.query(`INSERT INTO subscriptions (company_id,plan_id,status,current_period_end) VALUES (?,1,'active',?)`, { replacements:[companyId,end] });
    ok(`Subscription seeded (company ${companyId})`);
  } else warn('No companyId — subscription not seeded');

  // ═══════════════════════════════════════════════════════════════
  sect('4 · JOBS — /jobs');
  // ═══════════════════════════════════════════════════════════════

  r = await req('get', '/jobs');
  r.status===200 ? ok('GET /jobs (public list)') : fail('GET /jobs', r.data?.message);

  r = await req('post', '/jobs', { title:`FreelanceJob1${TAG}`, employmentType:'freelance', workMode:'remote', jobMode:'both', status:'open', description:'Test' }, recToken);
  if (r.status===201||r.status===200) { jobId=r.data.id??r.data.job?.id; ok(`POST /jobs (freelance, id=${jobId})`); }
  else fail('POST /jobs (freelance)', r.data?.message);

  r = await req('post', '/jobs', { title:`FreelanceJob2${TAG}`, employmentType:'freelance', workMode:'remote', jobMode:'both', status:'open', description:'Test2' }, recToken);
  if (r.status===201||r.status===200) { jobId2=r.data.id??r.data.job?.id; ok(`POST /jobs (freelance 2, id=${jobId2})`); }
  else fail('POST /jobs (freelance 2)', r.data?.message);

  r = await req('post', '/jobs', { title:`StdJob${TAG}`, employmentType:'full-time', workMode:'on-site', status:'open', description:'Standard' }, recToken);
  if (r.status===201||r.status===200) { stdJobId=r.data.id??r.data.job?.id; ok(`POST /jobs (full-time, id=${stdJobId})`); }
  else fail('POST /jobs (full-time)', r.data?.message);

  r = await req('post', '/jobs', { title:`InviteJob${TAG}`, employmentType:'freelance', workMode:'remote', jobMode:'both', status:'open', description:'Invitations only' }, recToken);
  if (r.status===201||r.status===200) { invJobId=r.data.id??r.data.job?.id; ok(`POST /jobs (invite-only, id=${invJobId})`); }
  else fail('POST /jobs (invite-only)', r.data?.message);

  if (jobId) {
    r = await req('get', `/jobs/${jobId}`);
    r.status===200 ? ok('GET /jobs/:id') : fail('GET /jobs/:id', r.data?.message);

    r = await req('put', `/jobs/${jobId}`, { title:`FreelanceJob1${TAG}-u` }, recToken);
    r.status===200 ? ok('PUT /jobs/:id') : fail('PUT /jobs/:id', r.data?.message);

  }

  // Status toggle test on stdJobId (keeps jobId always open for invitations/bids)
  if (stdJobId) {
    r = await req('patch', `/jobs/${stdJobId}/status`, { status:'closed' }, recToken);
    r.status===200 ? ok('PATCH /jobs/:id/status (close)') : fail('PATCH /jobs/:id/status', r.data?.message);
    await req('patch', `/jobs/${stdJobId}/status`, { status:'open' }, recToken); // reopen
  }

  r = await req('get', '/recruiter/jobs', null, recToken);
  r.status===200 ? ok('GET /recruiter/jobs') : fail('GET /recruiter/jobs', r.data?.message);

  // ═══════════════════════════════════════════════════════════════
  sect('5 · CANDIDATE PROFILE — /candidate');
  // ═══════════════════════════════════════════════════════════════

  r = await req('get', '/candidate/profile', null, candToken);
  r.status===200 ? ok('GET /candidate/profile') : fail('GET /candidate/profile', r.data?.message);

  r = await req('put', '/candidate/profile', { firstName:'TestCand', lastName:'Updated', headline:'Dev' }, candToken);
  r.status===200 ? ok('PUT /candidate/profile') : fail('PUT /candidate/profile', r.data?.message);

  r = await req('put', '/candidate/freelance', { active:true }, candToken);
  r.status===200 ? ok('PUT /candidate/freelance (activate)') : fail('PUT /candidate/freelance', r.data?.message);

  // Skills
  r = await req('post', '/candidate/skills', { name:'JavaScript', level:'Advanced' }, candToken);
  let skillId;
  if (r.status===201||r.status===200) { skillId=r.data.skillId??r.data.id; ok('POST /candidate/skills'); }
  else fail('POST /candidate/skills', r.data?.message);
  if (skillId) {
    r = await req('delete', `/candidate/skills/${skillId}`, null, candToken);
    r.status===200||r.status===204 ? ok('DELETE /candidate/skills/:id') : fail('DELETE /candidate/skills/:id', r.data?.message);
  }

  // Experience
  r = await req('post', '/candidate/experiences', { title:'Dev', company:'Acme', startDate:'2022-01-01' }, candToken);
  let expId;
  if (r.status===201||r.status===200) { expId=r.data.id; ok('POST /candidate/experiences'); }
  else fail('POST /candidate/experiences', r.data?.message);
  if (expId) {
    r = await req('put', `/candidate/experiences/${expId}`, { title:'Sr Dev', company:'Acme', startDate:'2022-01-01' }, candToken);
    r.status===200 ? ok('PUT /candidate/experiences/:id') : fail('PUT /candidate/experiences/:id', r.data?.message);
    r = await req('delete', `/candidate/experiences/${expId}`, null, candToken);
    r.status===200||r.status===204 ? ok('DELETE /candidate/experiences/:id') : fail('DELETE /candidate/experiences/:id', r.data?.message);
  }

  // Education
  r = await req('post', '/candidate/educations', { degree:'B.Sc.', institution:'UniTest', startYear:2018, endYear:2022 }, candToken);
  let eduId;
  if (r.status===201||r.status===200) { eduId=r.data.id; ok('POST /candidate/educations'); }
  else fail('POST /candidate/educations', r.data?.message);
  if (eduId) {
    r = await req('put', `/candidate/educations/${eduId}`, { degree:'M.Sc.', institution:'UniTest', startYear:2022 }, candToken);
    r.status===200 ? ok('PUT /candidate/educations/:id') : fail('PUT /candidate/educations/:id', r.data?.message);
    r = await req('delete', `/candidate/educations/${eduId}`, null, candToken);
    r.status===200||r.status===204 ? ok('DELETE /candidate/educations/:id') : fail('DELETE /candidate/educations/:id', r.data?.message);
  }

  // Saved jobs
  if (stdJobId) {
    r = await req('post', `/candidate/saved-jobs/${stdJobId}`, null, candToken);
    r.status===200||r.status===201 ? ok('POST /candidate/saved-jobs/:id') : fail('POST /candidate/saved-jobs/:id', r.data?.message);
    r = await req('get', '/candidate/saved-jobs', null, candToken);
    r.status===200 ? ok('GET /candidate/saved-jobs') : fail('GET /candidate/saved-jobs', r.data?.message);
    r = await req('get', '/candidate/saved-job-ids', null, candToken);
    r.status===200 ? ok('GET /candidate/saved-job-ids') : fail('GET /candidate/saved-job-ids', r.data?.message);
    r = await req('delete', `/candidate/saved-jobs/${stdJobId}`, null, candToken);
    r.status===200||r.status===204 ? ok('DELETE /candidate/saved-jobs/:id') : fail('DELETE /candidate/saved-jobs/:id', r.data?.message);
  }

  // ═══════════════════════════════════════════════════════════════
  sect('6 · BIDS — submit → withdraw → re-bid → accept; second bid → reject');
  // ═══════════════════════════════════════════════════════════════

  if (jobId) {
    // Submit initial bid
    r = await req('post', `/jobs/${jobId}/bids`, { price:500, deliveryTimeDays:7, message:'Test bid', bidType:'fixed' }, candToken);
    if (r.status===200||r.status===201) { bidId=r.data.id; ok(`POST /jobs/:id/bids → id=${bidId}`); }
    else fail('POST /jobs/:id/bids', r.data?.message);

    r = await req('get', `/jobs/${jobId}/bids`, null, recToken);
    r.status===200 ? ok('GET /jobs/:id/bids (recruiter)') : fail('GET /jobs/:id/bids', r.data?.message);
  }

  r = await req('get', '/me/bids', null, candToken);
  r.status===200 ? ok('GET /me/bids') : fail('GET /me/bids', r.data?.message);

  if (bidId) {
    // Withdraw
    r = await req('patch', `/bids/${bidId}/withdraw`, null, candToken);
    r.status===200 ? ok('PATCH /bids/:id/withdraw') : fail('PATCH /bids/:id/withdraw', r.data?.message);

    // Re-bid (allowed after withdrawal)
    r = await req('post', `/jobs/${jobId}/bids`, { price:600, deliveryTimeDays:10, message:'Re-bid', bidType:'fixed' }, candToken);
    if (r.status===200||r.status===201) { bidId=r.data.id; ok('POST /jobs/:id/bids (re-bid after withdraw)'); }
    else fail('POST /jobs/:id/bids (re-bid)', r.data?.message);

    // Accept (recruiter) — returns 201 + auto-creates contract
    r = await req('post', `/bids/${bidId}/accept`, null, recToken);
    if (r.status===201||r.status===200) { contractId=r.data.id; ok(`POST /bids/:id/accept → contract id=${contractId}`); }
    else fail('POST /bids/:id/accept', r.data?.message);
  }

  // Reject test on job2
  if (jobId2) {
    r = await req('post', `/jobs/${jobId2}/bids`, { price:400, deliveryTimeDays:5, message:'Bid for rejection test', bidType:'fixed' }, candToken);
    let bidId2;
    if (r.status===200||r.status===201) { bidId2=r.data.id; ok(`POST /jobs/:id/bids (job2, id=${bidId2})`); }
    else fail('POST /jobs/:id/bids (job2)', r.data?.message);
    if (bidId2) {
      r = await req('post', `/bids/${bidId2}/reject`, null, recToken);
      r.status===200 ? ok('POST /bids/:id/reject') : fail('POST /bids/:id/reject', r.data?.message);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  sect('7 · INVITATIONS');
  // ═══════════════════════════════════════════════════════════════

  r = await req('get', '/freelancers/search', null, recToken);
  r.status===200 ? ok('GET /freelancers/search') : fail('GET /freelancers/search', r.data?.message);

  // Invite 1 (invJobId — dedicated invite job, never closed by bids): confirm flow
  if (invJobId && candId) {
    r = await req('post', '/invitations', { jobId:invJobId, freelancerId:candId, title:'Invite1', message:'Hi', priceOffer:800, deliveryTimeDays:14 }, recToken);
    if (r.status===200||r.status===201) { invId=r.data.id; ok(`POST /invitations → id=${invId}`); }
    else fail('POST /invitations', r.data?.message);

    r = await req('get', `/jobs/${invJobId}/invitations`, null, recToken);
    r.status===200 ? ok('GET /jobs/:id/invitations') : fail('GET /jobs/:id/invitations', r.data?.message);
  }

  r = await req('get', '/me/invitations', null, candToken);
  r.status===200 ? ok('GET /me/invitations') : fail('GET /me/invitations', r.data?.message);

  // Confirm invite 1 (pending → confirmed; recruiter later creates pending contract)
  if (invId) {
    r = await req('post', `/invitations/${invId}/confirm`, null, candToken);
    r.status===200 ? ok('POST /invitations/:id/confirm') : fail('POST /invitations/:id/confirm', r.data?.message);
  }

  // Invite 2 (jobId2) → candidate rejects it
  if (jobId2 && candId) {
    r = await req('post', '/invitations', { jobId:jobId2, freelancerId:candId, title:'Invite2', message:'Hi2', priceOffer:900, deliveryTimeDays:7 }, recToken);
    if (r.status===200||r.status===201) {
      const invId2 = r.data.id;
      ok(`POST /invitations (job2) → id=${invId2}`);
      r = await req('post', `/invitations/${invId2}/reject`, null, candToken);
      r.status===200 ? ok('POST /invitations/:id/reject') : fail('POST /invitations/:id/reject', r.data?.message);
    } else fail('POST /invitations (job2)', r.data?.message);
  }

  // Revoke test: jobId2 invite was rejected → re-invite same freelancer on same job → revoke it
  // (SendInvitationHandler only blocks *pending* dupes, so post-reject resend is allowed)
  if (jobId2 && candId) {
    r = await req('post', '/invitations', { jobId:jobId2, freelancerId:candId, title:'InviteRevoke', message:'Revoke me', priceOffer:1000, deliveryTimeDays:5 }, recToken);
    if (r.status===200||r.status===201) {
      const invIdRevoke = r.data.id;
      ok(`POST /invitations (revoke) → id=${invIdRevoke}`);
      r = await req('patch', `/invitations/${invIdRevoke}/revoke`, null, recToken);
      r.status===200 ? ok('PATCH /invitations/:id/revoke') : fail('PATCH /invitations/:id/revoke', r.data?.message);
    } else warn('POST /invitations (revoke) skipped', r.data?.message);
  }

  // Create a pending contract from the confirmed invitation (Mode B: pending → approve)
  if (invId) {
    r = await req('post', '/contracts', {
      source: 'invitation', invitationId: invId,
      agreedPrice: 900, startDate: new Date().toISOString().slice(0,10)
    }, recToken);
    if (r.status===200||r.status===201) { pendingContractId=r.data.id; ok(`POST /contracts (invitation, pending) → id=${pendingContractId}`); }
    else fail('POST /contracts (invitation source)', r.data?.message);
  }

  // ═══════════════════════════════════════════════════════════════
  sect('8 · APPLICATIONS — /candidate/applications');
  // ═══════════════════════════════════════════════════════════════

  // Seed a CV path so application submission succeeds
  await seq.query(`UPDATE candidateprofiles SET cv_path='/uploads/cv/test.pdf' WHERE user_id=?`, { replacements:[candId] });

  if (stdJobId) {
    r = await req('post', '/candidate/applications', { jobId:stdJobId, coverLetter:'API test', yearsExperience:3, expectedSalary:60000 }, candToken);
    if (r.status===200||r.status===201) { appId=r.data.id; ok(`POST /candidate/applications → id=${appId}`); }
    else fail('POST /candidate/applications', r.data?.message);
  }

  r = await req('get', '/candidate/applications', null, candToken);
  r.status===200 ? ok('GET /candidate/applications') : fail('GET /candidate/applications', r.data?.message);

  if (appId) {
    r = await req('get', `/candidate/applications/${appId}/notes`, null, candToken);
    r.status===200 ? ok('GET /candidate/applications/:id/notes') : fail('GET /candidate/applications/:id/notes', r.data?.message);
  }

  r = await req('get', '/recruiter/applicants', null, recToken);
  r.status===200 ? ok('GET /recruiter/applicants') : fail('GET /recruiter/applicants', r.data?.message);
  const firstApp = r.data?.data?.[0];

  if (firstApp?.id) {
    r = await req('post', `/recruiter/applicants/${firstApp.id}/interview`, {
      interviewAt: new Date(Date.now()+24*60*60*1000).toISOString()
    }, recToken);
    r.status===200 ? ok('POST /recruiter/applicants/:id/interview') : fail('POST /recruiter/applicants/:id/interview', r.data?.message);
  } else warn('POST /recruiter/applicants/:id/interview — no applicant found, skipped');

  r = await req('get', '/recruiter/freelancers', null, recToken);
  r.status===200 ? ok('GET /recruiter/freelancers') : fail('GET /recruiter/freelancers', r.data?.message);

  // ═══════════════════════════════════════════════════════════════
  sect('9 · PIPELINE — /pipeline');
  // ═══════════════════════════════════════════════════════════════

  // Create pipeline first (new company has none)
  r = await req('post', '/pipeline', {
    stages: [
      { name:'CV Review',    hasCalendar:false },
      { name:'Interview',    hasCalendar:true  },
      { name:'Final Review', hasCalendar:false },
    ]
  }, recToken);
  r.status===200||r.status===201 ? ok('POST /pipeline (create)') : fail('POST /pipeline (create)', r.data?.message);

  r = await req('get', '/pipeline/my', null, recToken);
  r.status===200 ? ok('GET /pipeline/my') : fail('GET /pipeline/my', r.data?.message);

  r = await req('get', '/pipeline/board', null, recToken);
  r.status===200 ? ok('GET /pipeline/board') : fail('GET /pipeline/board', r.data?.message);
  const stages = r.data?.stages ?? [];

  r = await req('get', '/pipeline/notes', null, recToken);
  r.status===200 ? ok('GET /pipeline/notes') : fail('GET /pipeline/notes', r.data?.message);

  if (stdJobId) {
    r = await req('get', `/pipeline/job/${stdJobId}`, null, recToken);
    // Legacy endpoint — 404 is expected when no job-specific pipeline is configured
    r.status===200||r.status===404 ? ok(`GET /pipeline/job/:jobId (${r.status})`) : fail('GET /pipeline/job/:jobId', r.data?.message);
  }

  if (appId) {
    r = await req('get', `/pipeline/history/${appId}`, null, recToken);
    r.status===200 ? ok('GET /pipeline/history/:applicationId') : fail('GET /pipeline/history/:appId', r.data?.message);

    const targetStage = stages[1];
    if (targetStage) {
      // move uses toStageId (not stageId)
      r = await req('post', '/pipeline/move', { applicationId:appId, toStageId:targetStage.id, note:'API test move' }, recToken);
      r.status===200 ? ok('POST /pipeline/move') : fail('POST /pipeline/move', r.data?.message);

      // note requires stageId too
      r = await req('post', '/pipeline/note', { applicationId:appId, stageId:targetStage.id, note:'API test note' }, recToken);
      r.status===200 ? ok('POST /pipeline/note') : fail('POST /pipeline/note', r.data?.message);
    } else warn('POST /pipeline/move — only 1 stage, skipped');

    r = await req('post', '/pipeline/reject', { applicationId:appId }, recToken);
    r.status===200 ? ok('POST /pipeline/reject') : fail('POST /pipeline/reject', r.data?.message);
  }

  // Edit pipeline
  r = await req('put', '/pipeline', {
    stages: [
      { name:'Screening', hasCalendar:false },
      { name:'Interview', hasCalendar:true  },
    ]
  }, recToken);
  r.status===200 ? ok('PUT /pipeline (edit)') : fail('PUT /pipeline (edit)', r.data?.message);

  // ═══════════════════════════════════════════════════════════════
  sect('10 · CONTRACTS — /contracts');
  // ═══════════════════════════════════════════════════════════════

  // contractId = auto-created (status=active) when bid was accepted
  if (contractId) ok(`Bid contract exists (active) → id=${contractId}`);
  else warn('No contractId — bid accept may have failed');

  r = await req('get', '/contracts', null, recToken);
  r.status===200 ? ok('GET /contracts (recruiter)') : fail('GET /contracts (recruiter)', r.data?.message);

  r = await req('get', '/contracts', null, candToken);
  r.status===200 ? ok('GET /contracts (candidate)') : fail('GET /contracts (candidate)', r.data?.message);

  const anyContractId = pendingContractId ?? contractId;
  if (anyContractId) {
    r = await req('get', `/contracts/${anyContractId}`, null, recToken);
    r.status===200 ? ok('GET /contracts/:id') : fail('GET /contracts/:id', r.data?.message);
  }

  // Approve the pending (invitation-sourced) contract — bid contract is already active
  if (pendingContractId) {
    r = await req('post', `/contracts/${pendingContractId}/approve`, null, candToken);
    r.status===200 ? ok('POST /contracts/:id/approve') : fail('POST /contracts/:id/approve', r.data?.message);
  } else warn('POST /contracts/:id/approve — no pending contract, skipped');

  // ═══════════════════════════════════════════════════════════════
  sect('11 · NOTIFICATIONS — /notifications');
  // ═══════════════════════════════════════════════════════════════

  r = await req('get', '/notifications', null, recToken);
  r.status===200 ? ok('GET /notifications') : fail('GET /notifications', r.data?.message);
  notifId = r.data?.[0]?.id ?? r.data?.data?.[0]?.id;

  if (notifId) {
    r = await req('patch', `/notifications/${notifId}/read`, null, recToken);
    r.status===200 ? ok('PATCH /notifications/:id/read') : fail('PATCH /notifications/:id/read', r.data?.message);
  } else warn('PATCH /notifications/:id/read — no notifications, skipped');

  r = await req('patch', '/notifications/read-all', null, recToken);
  r.status===200 ? ok('PATCH /notifications/read-all') : fail('PATCH /notifications/read-all', r.data?.message);

  // ═══════════════════════════════════════════════════════════════
  sect('12 · CONVERSATIONS — /conversations');
  // ═══════════════════════════════════════════════════════════════

  r = await req('get', '/conversations', null, recToken);
  r.status===200 ? ok('GET /conversations') : fail('GET /conversations', r.data?.message);

  r = await req('post', '/conversations', { recipientId: candId }, recToken);
  if (r.status===200||r.status===201) { convId=r.data.id; ok(`POST /conversations → id=${convId}`); }
  else fail('POST /conversations', r.data?.message);

  if (convId) {
    r = await req('get', `/conversations/${convId}/messages`, null, recToken);
    r.status===200 ? ok('GET /conversations/:id/messages') : fail('GET /conversations/:id/messages', r.data?.message);
  }

  // ═══════════════════════════════════════════════════════════════
  sect('13 · SUBSCRIPTIONS — /subscriptions');
  // ═══════════════════════════════════════════════════════════════

  r = await req('get', '/subscriptions/my', null, recToken);
  r.status===200||r.status===404 ? ok('GET /subscriptions/my') : fail('GET /subscriptions/my', r.data?.message);

  // ═══════════════════════════════════════════════════════════════
  sect('14 · LOGOUT');
  // ═══════════════════════════════════════════════════════════════

  r = await req('post', '/users/logout', null, recToken, recCookies);
  r.status===200||r.status===204 ? ok('POST /users/logout') : fail('POST /users/logout', r.data?.message);

  // ═══════════════════════════════════════════════════════════════
  sect('15 · AUTH & ROLE GUARDS');
  // ═══════════════════════════════════════════════════════════════

  // No token → 401
  r = await req('get', '/recruiter/profile');
  r.status===401 ? ok('GET /recruiter/profile (no token) → 401') : fail('Unauthenticated guard', `expected 401 got ${r.status}`);

  // role('candidate') route called by recruiter → 403
  if (jobId) {
    r = await req('post', `/jobs/${jobId}/bids`, { price:1, deliveryTimeDays:1, message:'x', bidType:'fixed' }, recToken);
    r.status===403 ? ok('POST /jobs/:id/bids as recruiter → 403') : fail('Role guard (bids for candidate)', `expected 403 got ${r.status}`);
  }

  // role('recruiter') route called by candidate → 403
  r = await req('get', '/pipeline/board', null, candToken);
  r.status===403 ? ok('GET /pipeline/board as candidate → 403') : fail('Role guard (pipeline for recruiter)', `expected 403 got ${r.status}`);

  // ─────────────────────────────────────────────────────────────
  await cleanup([recEmail, candEmail]);

  // ═══════════════════════════════════════════════════════════════
  const total = passed + failed + warned;
  console.log('\n══════════════════════════════════════════════════════');
  console.log(` Results: ${passed}/${total} passed  |  ${failed} failed  |  ${warned} warnings`);
  if (failed === 0) console.log('\x1b[32m ALL TESTS PASSED \x1b[0m');
  else              console.log('\x1b[31m SOME TESTS FAILED \x1b[0m');
  console.log('══════════════════════════════════════════════════════\n');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error('\nFatal:', e.message); process.exit(1); });
