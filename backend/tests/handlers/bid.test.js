/**
 * Bid handler integration tests (Mode A + accept → contract).
 * Same shape as job.test.js: write via handler, await sync, assert read model.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const db = require('../helpers/db');
const fx = require('../helpers/fixtures');

const Job      = require('../../src/models/sql/Job');
const Bid      = require('../../src/models/sql/Bid');
const Contract = require('../../src/models/sql/Contract');
const BidView  = require('../../src/models/nosql/BidView');

const { syncBid } = require('../../src/sync/bidSync');

const submitBidHandler = require('../../src/application/bid/handlers/SubmitBidHandler');
const acceptBidHandler = require('../../src/application/bid/handlers/AcceptBidHandler');
const SubmitBidCommand = require('../../src/application/bid/commands/SubmitBid.command');
const AcceptBidCommand = require('../../src/application/bid/commands/AcceptBid.command');

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

async function freelancePublicJob(overrides = {}) {
  const company = await fx.createCompany();
  companyId = company.id;
  const freelancer = await fx.createFreelancer();
  freelancerId = freelancer.id;
  const job = await fx.createJob(companyId, {
    employmentType: 'freelance', jobMode: 'public', status: 'open', ...overrides,
  });
  jobId = job.id;
  return { company, freelancer, job };
}

describe('SubmitBidHandler', () => {
  test('creates a bid and projects it to the read model', async () => {
    await freelancePublicJob();

    const bid = await submitBidHandler.handle(new SubmitBidCommand({
      jobId, freelancerId, price: 500, deliveryTimeDays: 7, message: 'Hello',
    }));
    await syncBid(bid.id);

    expect(bid.status).toBe('pending');
    const doc = await BidView.findById(bid.id).lean();
    expect(doc).not.toBeNull();
    expect(doc.price).toBe(500);
    expect(doc.jobId).toBe(jobId);
  });

  test('rejects bids on an invite-only job (mode guard)', async () => {
    await freelancePublicJob({ jobMode: 'invite' });
    await expect(submitBidHandler.handle(new SubmitBidCommand({
      jobId, freelancerId, price: 500, deliveryTimeDays: 7,
    }))).rejects.toMatchObject({ status: 403, code: 'BIDS_NOT_ALLOWED' });
  });

  test('rejects a duplicate bid from the same freelancer', async () => {
    await freelancePublicJob();
    await submitBidHandler.handle(new SubmitBidCommand({ jobId, freelancerId, price: 500, deliveryTimeDays: 7 }));
    await expect(submitBidHandler.handle(new SubmitBidCommand({
      jobId, freelancerId, price: 600, deliveryTimeDays: 5,
    }))).rejects.toMatchObject({ status: 409, code: 'ALREADY_BID' });
  });

  test('rejects a bid once the job is closed', async () => {
    await freelancePublicJob({ status: 'closed' });
    await expect(submitBidHandler.handle(new SubmitBidCommand({
      jobId, freelancerId, price: 500, deliveryTimeDays: 7,
    }))).rejects.toMatchObject({ status: 409, code: 'JOB_NOT_OPEN' });
  });
});

describe('AcceptBidHandler', () => {
  test('creates a contract, closes the job, and rejects other bids', async () => {
    const { company } = await freelancePublicJob();

    // a competing freelancer also bids
    const other = await fx.createFreelancer();
    const otherBid = await fx.createBid(jobId, other.id, { price: 700 });

    const bid = await submitBidHandler.handle(new SubmitBidCommand({
      jobId, freelancerId, price: 500, deliveryTimeDays: 7,
    }));

    const contract = await acceptBidHandler.handle(new AcceptBidCommand(bid.id, company.id));

    expect(contract.source).toBe('bid');
    expect(Number(contract.agreedPrice)).toBe(500);

    const job = await Job.findByPk(jobId);
    expect(job.status).toBe('closed');
    expect(job.closedAt).not.toBeNull();

    expect((await Bid.findByPk(bid.id)).status).toBe('accepted');
    expect((await Bid.findByPk(otherBid.id)).status).toBe('rejected');

    const active = await Contract.count({ where: { jobId, status: 'active' } });
    expect(active).toBe(1);

    await fx.cleanupUser(other.id);
  });
});
