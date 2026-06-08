/**
 * End-to-end test: invitation confirm flow + real-time notifications.
 *
 * Registers fresh recruiter + candidate accounts, runs the full flow,
 * and cleans up test data at the end.
 *
 * Run from backend/: node test_invitation_flow.js
 */

const axios  = require('axios');
const { io } = require('socket.io-client');

const BASE   = 'http://localhost:3001/api';
const SOCKET = 'http://localhost:3001';
const PASS   = 'TestFlow99!';
const TAG    = `_testflow_${Date.now()}`;

// ── Helpers ──────────────────────────────────────────────────────────────────

const api = (token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return {
    get:   (url, cfg = {})       => axios.get(`${BASE}${url}`,  { headers, ...cfg }).then(r => r.data),
    post:  (url, body, cfg = {}) => axios.post(`${BASE}${url}`, body, { headers, ...cfg }).then(r => r.data),
    patch: (url, body, cfg = {}) => axios.patch(`${BASE}${url}`, body, { headers, ...cfg }).then(r => r.data),
  };
};

function pass(msg) { console.log(`  ✅  ${msg}`); }
function fail(msg) { console.log(`  ❌  ${msg}`); process.exitCode = 1; }
function info(msg) { console.log(`  ℹ️   ${msg}`); }

function waitForEvent(socket, event, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for "${event}"`)), timeoutMs);
    socket.once(event, (data) => { clearTimeout(timer); resolve(data); });
  });
}

function connectSocket(token) {
  return new Promise((resolve, reject) => {
    const sock = io(SOCKET, { auth: { token }, transports: ['websocket'] });
    sock.once('connect',       () => resolve(sock));
    sock.once('connect_error', (e) => reject(e));
    setTimeout(() => reject(new Error('Socket connect timeout')), 5000);
  });
}

// ── Test data cleanup ─────────────────────────────────────────────────────────

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(
  process.env.MYSQL_DB, process.env.MYSQL_USER, process.env.MYSQL_PASS,
  { host: process.env.MYSQL_HOST, port: process.env.MYSQL_PORT || 3306, dialect: 'mysql', logging: false }
);

async function cleanup(recruiterEmail, candidateEmail) {
  info('Cleaning up test data…');
  try {
    const [users] = await sequelize.query(
      `SELECT id FROM users WHERE email IN (?, ?)`,
      { replacements: [recruiterEmail, candidateEmail] }
    );
    const ids = users.map(u => u.id);
    if (!ids.length) return;

    const placeholders = ids.map(() => '?').join(',');
    // Delete in FK order
    await sequelize.query(`DELETE FROM notifications   WHERE user_id IN (${placeholders})`, { replacements: ids });
    await sequelize.query(`DELETE FROM invitations     WHERE company_id IN (SELECT id FROM companies WHERE id IN (SELECT company_id FROM recruiterprofiles WHERE user_id IN (${placeholders}))) OR freelancer_id IN (${placeholders})`, { replacements: [...ids, ...ids] });
    await sequelize.query(`DELETE FROM jobs            WHERE recruiter_id IN (${placeholders})`, { replacements: ids });
    await sequelize.query(`DELETE FROM subscriptions   WHERE company_id IN (SELECT id FROM companies WHERE id IN (SELECT company_id FROM recruiterprofiles WHERE user_id IN (${placeholders})))`, { replacements: ids });
    await sequelize.query(`DELETE FROM companies       WHERE id IN (SELECT company_id FROM recruiterprofiles WHERE user_id IN (${placeholders}))`, { replacements: ids });
    await sequelize.query(`DELETE FROM recruiterprofiles WHERE user_id IN (${placeholders})`, { replacements: ids });
    await sequelize.query(`DELETE FROM candidateprofiles WHERE user_id IN (${placeholders})`, { replacements: ids });
    await sequelize.query(`DELETE FROM userroles       WHERE user_id IN (${placeholders})`, { replacements: ids });
    await sequelize.query(`DELETE FROM refreshtokens   WHERE user_id IN (${placeholders})`, { replacements: ids });
    await sequelize.query(`DELETE FROM users           WHERE id IN (${placeholders})`, { replacements: ids });
    info('Cleanup done.');
  } catch (e) {
    info(`Cleanup partial: ${e.message}`);
  }
  await sequelize.close();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  const recruiterEmail  = `recruiter${TAG}@test.local`;
  const candidateEmail  = `candidate${TAG}@test.local`;

  console.log('\n══════════════════════════════════════════════');
  console.log(' Invitation Confirm Flow + Real-time Test');
  console.log('══════════════════════════════════════════════\n');

  let rToken, cToken, rUserId, cUserId, jobId, invitationId;
  let recruiterSock, candidateSock;

  try {

    // ── 1. Register recruiter ─────────────────────────────────────────────
    console.log('1. Register & login recruiter');
    await api().post('/users/register', {
      firstName: 'TestRecruiter', lastName: 'Flow', email: recruiterEmail, password: PASS, role: 'recruiter',
    });
    const rLogin = await api().post('/users/login', { email: recruiterEmail, password: PASS });
    rToken  = rLogin.token;
    rUserId = rLogin.user.id;
    pass(`Recruiter registered & logged in (id=${rUserId})`);

    // ── 2. Setup recruiter company ────────────────────────────────────────
    console.log('\n2. Setup company profile');
    await api(rToken).post('/recruiter/setup', { companyName: `TestCo ${TAG}`, industry: 'Technology' });
    // Re-login to pick up companyId in JWT
    const rLogin2 = await api().post('/users/login', { email: recruiterEmail, password: PASS });
    rToken = rLogin2.token;
    pass(`Company created, new token with companyId`);

    // ── 3. Insert test subscription so job creation is allowed ───────────
    console.log('\n3. Grant subscription for test recruiter company');
    const profile = await api(rToken).get('/recruiter/profile');
    const companyId = profile?.company?.id;
    if (!companyId) { fail('Could not resolve companyId from profile'); return; }
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    await sequelize.query(
      `INSERT INTO subscriptions (company_id, plan_id, status, current_period_end) VALUES (?, 1, 'active', ?)`,
      { replacements: [companyId, periodEnd] }
    );
    pass(`Subscription inserted for company ${companyId}`);

    // ── 4. Create invite-only freelance job ───────────────────────────────
    console.log('\n4. Create freelance job (jobMode=invite)');
    const jobBody = {
      title: `TestJob ${TAG}`, employmentType: 'freelance', workMode: 'remote',
      jobMode: 'invite', status: 'open', description: 'Test job for flow',
    };
    const jobRes = await api(rToken).post('/jobs', jobBody);
    jobId = jobRes.id ?? jobRes.job?.id;
    if (!jobId) fail('Job creation returned no id'); else pass(`Job created (id=${jobId})`);

    // ── 5. Register & login candidate ─────────────────────────────────────
    console.log('\n5. Register & login candidate (freelancer)');
    await api().post('/users/register', {
      firstName: 'TestCandidate', lastName: 'Flow', email: candidateEmail, password: PASS, role: 'candidate',
    });
    const cLogin = await api().post('/users/login', { email: candidateEmail, password: PASS });
    cToken  = cLogin.token;
    cUserId = cLogin.user.id;
    pass(`Candidate registered & logged in (id=${cUserId})`);

    // ── 6. Connect WebSockets ─────────────────────────────────────────────
    console.log('\n6. Connect WebSockets for both users');
    [recruiterSock, candidateSock] = await Promise.all([
      connectSocket(rToken),
      connectSocket(cToken),
    ]);
    pass(`Recruiter socket connected (room user:${rUserId})`);
    pass(`Candidate socket connected (room user:${cUserId})`);

    // ── 7. Send invitation — listen for real-time notification ────────────
    console.log('\n7. Send invitation → expect real-time notification to candidate');
    const notifPromise = waitForEvent(candidateSock, 'notification:new', 6000);

    const inv = await api(rToken).post('/invitations', {
      jobId, freelancerId: cUserId,
      title: `Invitation for TestJob`,
      message: 'Hi, we think you are a great fit!',
      priceOffer: 1500,
      deliveryTimeDays: 14,
    });
    invitationId = inv.id;
    pass(`Invitation sent (id=${invitationId}, status=${inv.status})`);

    // Wait for real-time push
    try {
      const notif = await notifPromise;
      if (notif.type === 'invitation_received') {
        pass(`Real-time notification received by candidate: type="${notif.type}", link="${notif.link}"`);
      } else {
        fail(`Wrong notification type: "${notif.type}" (expected "invitation_received")`);
      }
    } catch {
      fail('No real-time notification received within 6 s');
    }

    // ── 8. Verify notification in REST /notifications list ────────────────
    console.log('\n8. Verify notification persisted in REST API');
    const notifList = await api(cToken).get('/notifications');
    const myInvNotif = (notifList.data ?? notifList).find(n => n.type === 'invitation_received' && n.link?.includes('invitations'));
    if (myInvNotif) {
      pass(`Notification in REST list: "${myInvNotif.message}", link="${myInvNotif.link}"`);
    } else {
      fail('Invitation notification not found in REST /notifications');
    }

    // ── 9. Verify invitation status is 'pending' ──────────────────────────
    console.log('\n9. Verify invitation status = pending on candidate inbox');
    const myInvites = await api(cToken).get('/me/invitations');
    const pending = (myInvites.data ?? []).find(i => i.id === invitationId);
    if (pending?.status === 'pending') {
      pass(`Invitation status = pending ✓`);
    } else {
      fail(`Expected pending, got: ${pending?.status ?? 'NOT FOUND'}`);
    }

    // ── 10. Confirm invitation as candidate — recruiter listens ───────────
    console.log('\n10. Candidate confirms → expect real-time notification to recruiter');
    const recruiterNotifPromise = waitForEvent(recruiterSock, 'notification:new', 6000);

    const confirmed = await api(cToken).post(`/invitations/${invitationId}/confirm`);
    if (confirmed.status === 'confirmed') {
      pass(`Invitation confirmed, status = confirmed ✓`);
    } else {
      fail(`Expected status=confirmed, got: ${confirmed.status}`);
    }

    // Wait for recruiter real-time notification
    try {
      const rNotif = await recruiterNotifPromise;
      if (rNotif.type === 'invitation_confirmed') {
        pass(`Recruiter got real-time notification: type="${rNotif.type}", link="${rNotif.link}"`);
      } else {
        fail(`Wrong notification type for recruiter: "${rNotif.type}" (expected "invitation_confirmed")`);
      }
    } catch {
      fail('Recruiter did not receive real-time notification within 6 s');
    }

    // Brief pause: MongoDB read-side sync is async — give it time to project
    await new Promise(r => setTimeout(r, 800));

    // ── 11. Verify recruiter sees confirmed invitation via job endpoint ────
    console.log('\n11. Recruiter sees confirmed invitation via /jobs/:id/invitations');
    const recruiterInvites = await api(rToken).get(`/jobs/${jobId}/invitations`);
    const confirmedInv = (recruiterInvites.data ?? []).find(i => i.id === invitationId);
    if (confirmedInv?.status === 'confirmed') {
      pass(`Recruiter sees status=confirmed on invitation ✓`);
    } else {
      fail(`Expected confirmed, recruiter sees: ${confirmedInv?.status ?? 'NOT FOUND'}`);
    }

    // ── 12. Verify invitation shows in candidate inbox as confirmed ────────
    console.log('\n12. Candidate inbox shows status = confirmed');
    const myInvites2 = await api(cToken).get('/me/invitations');
    const confirmedForCandidate = (myInvites2.data ?? []).find(i => i.id === invitationId);
    if (confirmedForCandidate?.status === 'confirmed') {
      pass(`Candidate inbox shows status=confirmed ✓`);
    } else {
      fail(`Expected confirmed, candidate sees: ${confirmedForCandidate?.status ?? 'NOT FOUND'}`);
    }

  } catch (err) {
    fail(`Unexpected error: ${err.response?.data?.message ?? err.message}`);
    if (err.response?.data) console.log('    Response:', JSON.stringify(err.response.data));
  } finally {
    recruiterSock?.disconnect();
    candidateSock?.disconnect();
    await cleanup(recruiterEmail, candidateEmail);
    console.log(`\n══════════════════════════════════════════════`);
    console.log(process.exitCode ? ' RESULT: SOME TESTS FAILED' : ' RESULT: ALL TESTS PASSED');
    console.log(`══════════════════════════════════════════════\n`);
    process.exit(process.exitCode ?? 0);
  }
}

run();
