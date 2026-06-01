/**
 * Invitation handler integration tests (Mode B) + the contract race (edge #5).
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const db = require('../helpers/db');
const fx = require('../helpers/fixtures');

const Job             = require('../../src/models/sql/Job');
const Contract        = require('../../src/models/sql/Contract');
const InvitationView  = require('../../src/models/nosql/InvitationView');

const { syncInvitation } = require('../../src/sync/invitationSync');

const sendInvitationHandler   = require('../../src/application/invitation/handlers/SendInvitationHandler');
const acceptInvitationHandler = require('../../src/application/invitation/handlers/AcceptInvitationHandler');
const rejectInvitationHandler = require('../../src/application/invitation/handlers/RejectInvitationHandler');
const acceptBidHandler        = require('../../src/application/bid/handlers/AcceptBidHandler');

const SendInvitationCommand   = require('../../src/application/invitation/commands/SendInvitation.command');
const AcceptInvitationCommand = require('../../src/application/invitation/commands/AcceptInvitation.command');
const RejectInvitationCommand = require('../../src/application/invitation/commands/RejectInvitation.command');
const AcceptBidCommand        = require('../../src/application/bid/commands/AcceptBid.command');

let companyId;
let freelancerId;
let jobId;

beforeAll(() => db.connect());
afterAll(() => db.disconnect());

afterEach(async () => {
  await fx.cleanupJob(jobId);
  await fx.cleanupUser(freelancerId);
  await fx.cleanupCompany(companyId);
  jobId = freelancerId = companyId = null;
});

async function freelanceJob(jobMode = 'invite') {
  const company = await fx.createCompany();
  companyId = company.id;
  const freelancer = await fx.createFreelancer();
  freelancerId = freelancer.id;
  const job = await fx.createJob(companyId, { employmentType: 'freelance', jobMode, status: 'open' });
  jobId = job.id;
  return { company, freelancer, job };
}

describe('SendInvitationHandler', () => {
  test('sends an invitation and projects it', async () => {
    await freelanceJob('invite');
    const inv = await sendInvitationHandler.handle(new SendInvitationCommand({
      companyId, freelancerId, jobId, priceOffer: 800, deliveryTimeDays: 10, message: 'Join us',
    }));
    await syncInvitation(inv.id);

    expect(inv.status).toBe('pending');
    const doc = await InvitationView.findById(inv.id).lean();
    expect(doc.priceOffer).toBe(800);
    expect(doc.freelancerId).toBe(freelancerId);
  });

  test('rejects a duplicate pending invitation', async () => {
    await freelanceJob('invite');
    await sendInvitationHandler.handle(new SendInvitationCommand({ companyId, freelancerId, jobId, priceOffer: 800 }));
    await expect(sendInvitationHandler.handle(new SendInvitationCommand({
      companyId, freelancerId, jobId, priceOffer: 900,
    }))).rejects.toMatchObject({ status: 409, code: 'ALREADY_INVITED' });
  });

  test('rejects invitations on a public-only job (mode guard)', async () => {
    await freelanceJob('public');
    await expect(sendInvitationHandler.handle(new SendInvitationCommand({
      companyId, freelancerId, jobId, priceOffer: 800,
    }))).rejects.toMatchObject({ status: 403, code: 'INVITES_NOT_ALLOWED' });
  });
});

describe('AcceptInvitationHandler', () => {
  test('accepting an invitation creates a contract and closes the job', async () => {
    await freelanceJob('invite');
    const inv = await fx.createInvitation(companyId, freelancerId, jobId, { priceOffer: 800 });

    const contract = await acceptInvitationHandler.handle(
      new AcceptInvitationCommand(inv.id, freelancerId),
    );

    expect(contract.source).toBe('invite');
    expect(Number(contract.agreedPrice)).toBe(800);
    expect((await Job.findByPk(jobId)).status).toBe('closed');
  });

  test('rejecting an invitation closes it without a contract', async () => {
    await freelanceJob('invite');
    const inv = await fx.createInvitation(companyId, freelancerId, jobId);
    const out = await rejectInvitationHandler.handle(new RejectInvitationCommand(inv.id, freelancerId));
    expect(out.status).toBe('rejected');
    expect(await Contract.count({ where: { jobId } })).toBe(0);
  });
});

describe('Contract creation race (edge case #5)', () => {
  test('concurrent bid-accept and invite-accept yield exactly one contract', async () => {
    const { company } = await freelanceJob('both');     // Mode C: bids AND invites
    const bid = await fx.createBid(jobId, freelancerId, { price: 500 });
    const inv = await fx.createInvitation(companyId, freelancerId, jobId, { priceOffer: 800 });

    const results = await Promise.allSettled([
      acceptBidHandler.handle(new AcceptBidCommand(bid.id, company.id)),
      acceptInvitationHandler.handle(new AcceptInvitationCommand(inv.id, freelancerId)),
    ]);

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected  = results.filter(r => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(await Contract.count({ where: { jobId, status: 'active' } })).toBe(1);
  });
});
