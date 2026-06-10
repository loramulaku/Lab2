'use strict';

/**
 * End-to-end test: candidate pipeline → hire flow.
 *
 * Uses existing test accounts created by seedTestData.js:
 *   Candidate:  Alban Hoxha   (alban.hoxha@seeker.test)
 *   Recruiter:  Granit Berisha (granit.berisha@seeker.test)
 *   Pipeline:   Application → CV Review → Technical Interview → HR Interview
 *
 * Run: node backend/scripts/seedPipelineTestData.js
 */

require('dotenv').config();

const axios   = require('axios');
const { sequelize } = require('../src/config/mysql');
const Application   = require('../src/models/sql/Application');
const Contract      = require('../src/models/sql/Contract');
const Notification  = require('../src/models/sql/Notification');

const BASE = 'http://localhost:3001/api';
const PW   = 'Seeker@1234';

const CANDIDATE_EMAIL = 'alban.hoxha@seeker.test';
const RECRUITER_EMAIL = 'granit.berisha@seeker.test';

// ── helpers ───────────────────────────────────────────────────────────────────

async function login(email) {
  const res = await axios.post(`${BASE}/users/login`, { email, password: PW });
  return { token: res.data.token, userId: res.data.user.id };
}

function auth(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Pipeline + Hire End-to-End Test ===\n');

  // ── Step 1: Login ─────────────────────────────────────────────────────────
  console.log('Step 1: Logging in…');
  const recruiter = await login(RECRUITER_EMAIL);
  const candidate = await login(CANDIDATE_EMAIL);
  console.log(`  ✓ Recruiter (Granit) logged in  — userId=${recruiter.userId}`);
  console.log(`  ✓ Candidate (Alban)  logged in  — userId=${candidate.userId}`);

  // ── Step 2: Get pipeline board ────────────────────────────────────────────
  console.log('\nStep 2: Fetching pipeline board…');
  const boardRes = await axios.get(`${BASE}/pipeline/board`, auth(recruiter.token));
  const { stages } = boardRes.data;

  if (!stages || stages.length === 0) {
    throw new Error('No pipeline stages found for Granit. Run seedTestData.js first.');
  }

  console.log(`  Pipeline stages (${stages.length}):`);
  for (const s of stages) {
    console.log(`    [${s.id}] ${s.name}  (${s.candidates.length} candidates)`);
  }

  // Find Alban's application card on the board (could be in any stage)
  let albansCard = null;
  for (const s of stages) {
    albansCard = s.candidates.find(c => c.userId === candidate.userId);
    if (albansCard) break;
  }

  if (!albansCard) {
    throw new Error(
      `Alban (userId=${candidate.userId}) is not on the pipeline board. ` +
      `Run seedTestData.js to create the application.`
    );
  }

  const { applicationId } = albansCard;
  console.log(`\n  ✓ Found Alban on board — applicationId=${applicationId}, stageId=${albansCard.stageId}`);

  // ── Step 3: Move through all non-Application stages ───────────────────────
  // Stages[0] is "Application" (the entry stage — no move needed to get there).
  // We move Alban through stages[1], stages[2], … stages[N-1] (all except last).
  // The last stage is where the hire contract is created, not a move.

  const movableStages = stages.slice(1); // skip "Application"

  console.log(`\nStep 3: Moving Alban through ${movableStages.length} stage(s)…`);

  for (let i = 0; i < movableStages.length; i++) {
    const stage = movableStages[i];
    const isLast = i === movableStages.length - 1;
    const stepLabel = isLast ? '(final stage — hire will happen here)' : '';

    // 3a. Before each move (except the very first), we must have already marked
    //     the previous notification as read. We handle read-marking after each
    //     move below, so by the time we reach here it should already be read.
    //     On the first move, there are no prior notifications for this app.

    console.log(`\n  ─── Stage ${i + 1}/${movableStages.length}: "${stage.name}" ${stepLabel}`);

    // 3b. Move Alban to this stage
    const moveNote = `Test move to ${stage.name} — automated pipeline test on ${new Date().toISOString().slice(0, 10)}`;
    await axios.post(`${BASE}/pipeline/move`, {
      applicationId,
      toStageId: stage.id,
      note:      moveNote,
    }, auth(recruiter.token));
    console.log(`    ✓ Moved to "${stage.name}" (stageId=${stage.id})`);

    // 3c. As candidate: fetch notifications, find the unread pipeline_stage_change
    //     for this application, and mark it as read.
    const notifRes = await axios.get(`${BASE}/notifications`, auth(candidate.token));
    const notifs   = Array.isArray(notifRes.data) ? notifRes.data : (notifRes.data?.notifications ?? []);

    const unread = notifs.find(
      n => n.type === 'pipeline_stage_change' && !n.isRead && n.applicationId === applicationId
    );

    if (!unread) {
      // Fallback: look directly in MySQL (avoids any timing issue with the response body)
      const dbNotif = await Notification.findOne({
        where: { userId: candidate.userId, applicationId, type: 'pipeline_stage_change', isRead: false },
        order: [['created_at', 'DESC']],
      });
      if (!dbNotif) {
        throw new Error(`No unread pipeline_stage_change notification found for stage "${stage.name}"`);
      }
      await axios.patch(`${BASE}/notifications/${dbNotif.id}/read`, {}, auth(candidate.token));
      console.log(`    ✓ Notification #${dbNotif.id} marked as read (fetched from MySQL)`);
    } else {
      await axios.patch(`${BASE}/notifications/${unread.id}/read`, {}, auth(candidate.token));
      console.log(`    ✓ Notification #${unread.id} marked as read`);
    }
  }

  // ── Step 4: Recruiter creates hire contract at last stage ─────────────────
  const lastStage = movableStages[movableStages.length - 1];
  console.log(`\nStep 4: Recruiter creates pipeline contract at "${lastStage.name}"…`);

  const contractRes = await axios.post(`${BASE}/contracts`, {
    source:       'pipeline',
    applicationId,
    agreedPrice:  2500,
    startDate:    '2026-07-01',
    endDate:      '2027-06-30',
  }, auth(recruiter.token));

  const contractId = contractRes.data.id ?? contractRes.data.contract?.id;
  if (!contractId) throw new Error('Contract creation returned no id');
  console.log(`  ✓ Contract created (id=${contractId}, status=${contractRes.data.status ?? contractRes.data.contract?.status})`);

  // ── Step 5: Candidate receives contract_offer notification ────────────────
  console.log('\nStep 5: Checking candidate received contract_offer notification…');
  const notifRes2  = await axios.get(`${BASE}/notifications`, auth(candidate.token));
  const notifs2    = Array.isArray(notifRes2.data) ? notifRes2.data : (notifRes2.data?.notifications ?? []);
  const contractNotif = notifs2.find(n => n.type === 'contract_offer' && !n.isRead);

  if (contractNotif) {
    console.log(`  ✓ contract_offer notification found (id=${contractNotif.id})`);
  } else {
    // Try MySQL
    const dbNotif = await Notification.findOne({
      where: { userId: candidate.userId, type: 'contract_offer' },
      order: [['created_at', 'DESC']],
    });
    if (dbNotif) {
      console.log(`  ✓ contract_offer notification found in MySQL (id=${dbNotif.id})`);
    } else {
      console.log(`  ⚠ contract_offer notification not found — continuing anyway`);
    }
  }

  // ── Step 6: Candidate approves contract ───────────────────────────────────
  console.log('\nStep 6: Candidate (Alban) approves contract…');
  const approveRes = await axios.post(`${BASE}/contracts/${contractId}/approve`, {}, auth(candidate.token));
  console.log(`  ✓ Contract approved (status=${approveRes.data.status ?? approveRes.data.contract?.status})`);

  // ── Step 7: Verify in MySQL ────────────────────────────────────────────────
  console.log('\nStep 7: Verifying in MySQL…');

  const contract = await Contract.findOne({
    where: { id: contractId, source: 'pipeline', status: 'active' },
  });

  const application = await Application.findByPk(applicationId);

  const contractOk = !!contract;
  const appOk      = application?.status === 'hired';

  console.log(`  Contract (id=${contractId}) status: ${contract?.status ?? 'NOT FOUND'} ${contractOk ? '✓' : '✗'}`);
  console.log(`  Application (id=${applicationId}) status: ${application?.status ?? 'NOT FOUND'} ${appOk ? '✓' : '✗'}`);

  // ── Results ────────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════');
  console.log('  CREDENTIALS');
  console.log('══════════════════════════════════════════\n');
  console.log('  Candidate (Alban Hoxha)');
  console.log(`    Email:    ${CANDIDATE_EMAIL}`);
  console.log(`    Password: ${PW}\n`);
  console.log('  Recruiter (Granit Berisha)');
  console.log(`    Email:    ${RECRUITER_EMAIL}`);
  console.log(`    Password: ${PW}\n`);

  console.log('══════════════════════════════════════════');
  console.log('  FLOW RESULT');
  console.log('══════════════════════════════════════════');
  const passed = contractOk && appOk;
  console.log(`  Pipeline → Hire: ${passed ? '✓ PASSED' : '✗ FAILED'}`);
  if (!contractOk) console.log(`    ✗ Contract not active in MySQL`);
  if (!appOk)      console.log(`    ✗ Application status is "${application?.status}" (expected "hired")`);
  console.log('══════════════════════════════════════════\n');

  if (!passed) process.exitCode = 1;

  await sequelize.close();
  console.log('=== Done ===');
}

main().catch(async (err) => {
  console.error('\n[FATAL]', err?.response?.data ?? err.message);
  if (err?.response?.data) console.error('Response status:', err.response.status);
  await sequelize.close().catch(() => {});
  process.exit(1);
});
