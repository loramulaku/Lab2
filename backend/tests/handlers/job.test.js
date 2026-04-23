/**
 * Job handler integration tests
 *
 * Each test:
 *  1. Creates MySQL data via fixtures
 *  2. Calls the handler (fires fire-and-forget sync internally)
 *  3. Awaits syncJob() explicitly to guarantee MongoDB is current
 *  4. Asserts the MongoDB read model reflects the change
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const db      = require('../helpers/db');
const fx      = require('../helpers/fixtures');
const { syncJob } = require('../../src/sync/jobSync');
const JobView     = require('../../src/models/nosql/JobView');

// Handlers
const createJobHandler    = require('../../src/application/job/handlers/CreateJobHandler');
const updateJobHandler    = require('../../src/application/job/handlers/UpdateJobHandler');
const deleteJobHandler    = require('../../src/application/job/handlers/DeleteJobHandler');
const getJobByIdHandler   = require('../../src/application/job/handlers/GetJobByIdHandler');

// Commands / Queries
const CreateJobCommand  = require('../../src/application/job/commands/CreateJob.command');
const UpdateJobCommand  = require('../../src/application/job/commands/UpdateJob.command');
const DeleteJobCommand  = require('../../src/application/job/commands/DeleteJob.command');
const GetJobByIdQuery   = require('../../src/application/job/queries/GetJobById.query');

let companyId;
let jobId;

beforeAll(() => db.connect());
afterAll(() => db.disconnect());

afterEach(async () => {
  await fx.cleanupJob(jobId);
  await fx.cleanupCompany(companyId);
  jobId     = null;
  companyId = null;
});

// ─────────────────────────────────────────────────────────────────────────────
describe('CreateJobHandler', () => {
  test('creates job and syncs core fields to MongoDB', async () => {
    const company = await fx.createCompany({ name: 'Creator Corp' });
    companyId = company.id;

    const job = await createJobHandler.handle(
      new CreateJobCommand({
        companyId,
        title:          'Backend Engineer',
        description:    'Build APIs',
        employmentType: 'full-time',
        workMode:       'remote',
      })
    );
    jobId = job.id;
    await syncJob(jobId);

    const doc = await JobView.findById(jobId).lean();
    expect(doc).not.toBeNull();
    expect(doc.title).toBe('Backend Engineer');
    expect(doc.description).toBe('Build APIs');
    expect(doc.employmentType).toBe('full-time');
    expect(doc.workMode).toBe('remote');
    expect(doc.status).toBe('open');
  });

  test('creates job with skills and syncs skill names to MongoDB', async () => {
    const company = await fx.createCompany();
    companyId = company.id;
    const skill1  = await fx.createSkill(`Python_${Date.now()}`);
    const skill2  = await fx.createSkill(`FastAPI_${Date.now()}`);

    const job = await createJobHandler.handle(
      new CreateJobCommand({
        companyId,
        title:       'Python Dev',
        skillIds:    [skill1.id, skill2.id],
        categoryIds: [],
      })
    );
    jobId = job.id;
    await syncJob(jobId);

    const doc = await JobView.findById(jobId).lean();
    expect(doc.skills).toHaveLength(2);
    expect(doc.skills).toEqual(expect.arrayContaining([skill1.name, skill2.name]));
  });

  test('creates job with categories and syncs category names to MongoDB', async () => {
    const company = await fx.createCompany();
    companyId = company.id;
    const cat = await fx.createCategory(`Engineering_${Date.now()}`);

    const job = await createJobHandler.handle(
      new CreateJobCommand({
        companyId,
        title:       'Engineer',
        categoryIds: [cat.id],
      })
    );
    jobId = job.id;
    await syncJob(jobId);

    const doc = await JobView.findById(jobId).lean();
    expect(doc.categories).toContain(cat.name);
  });

  test('embeds company snapshot in MongoDB view', async () => {
    const company = await fx.createCompany({
      name:    'Snapshot Co',
      website: 'https://snapshot.example.com',
    });
    companyId = company.id;

    const job = await createJobHandler.handle(
      new CreateJobCommand({ companyId, title: 'Any Role' })
    );
    jobId = job.id;
    await syncJob(jobId);

    const doc = await JobView.findById(jobId).lean();
    expect(doc.company.id).toBe(companyId);
    expect(doc.company.name).toBe('Snapshot Co');
    expect(doc.company.website).toBe('https://snapshot.example.com');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('UpdateJobHandler', () => {
  test('updates title and syncs to MongoDB', async () => {
    const company = await fx.createCompany();
    companyId = company.id;
    const job = await fx.createJob(companyId, { title: 'Before' });
    jobId = job.id;

    await updateJobHandler.handle(new UpdateJobCommand(jobId, { title: 'After' }));
    await syncJob(jobId);

    const doc = await JobView.findById(jobId).lean();
    expect(doc.title).toBe('After');
  });

  test('replaces skills when skillIds provided', async () => {
    const company = await fx.createCompany();
    companyId = company.id;
    const skillA  = await fx.createSkill(`SkillA_${Date.now()}`);
    const skillB  = await fx.createSkill(`SkillB_${Date.now()}`);
    const job     = await fx.createJob(companyId);
    jobId = job.id;

    // Initial sync with skillA
    const JobSkill = require('../../src/models/sql/JobSkill');
    await JobSkill.create({ jobId, skillId: skillA.id });
    await syncJob(jobId);

    // Update replacing skillA with skillB
    await updateJobHandler.handle(
      new UpdateJobCommand(jobId, { skillIds: [skillB.id] })
    );
    await syncJob(jobId);

    const doc = await JobView.findById(jobId).lean();
    expect(doc.skills).toHaveLength(1);
    expect(doc.skills[0]).toBe(skillB.name);
  });

  test('clears all skills when skillIds is empty array', async () => {
    const company = await fx.createCompany();
    companyId = company.id;
    const skill   = await fx.createSkill(`ToRemove_${Date.now()}`);
    const job     = await fx.createJob(companyId);
    jobId = job.id;

    const JobSkill = require('../../src/models/sql/JobSkill');
    await JobSkill.create({ jobId, skillId: skill.id });
    await syncJob(jobId);

    await updateJobHandler.handle(new UpdateJobCommand(jobId, { skillIds: [] }));
    await syncJob(jobId);

    const doc = await JobView.findById(jobId).lean();
    expect(doc.skills).toEqual([]);
  });

  test('does not touch skills when skillIds is undefined', async () => {
    const company = await fx.createCompany();
    companyId = company.id;
    const skill   = await fx.createSkill(`Preserved_${Date.now()}`);
    const job     = await fx.createJob(companyId);
    jobId = job.id;

    const JobSkill = require('../../src/models/sql/JobSkill');
    await JobSkill.create({ jobId, skillId: skill.id });
    await syncJob(jobId);

    // Update title only — no skillIds in command
    await updateJobHandler.handle(new UpdateJobCommand(jobId, { title: 'New Title' }));
    await syncJob(jobId);

    const doc = await JobView.findById(jobId).lean();
    expect(doc.title).toBe('New Title');
    expect(doc.skills).toHaveLength(1);
    expect(doc.skills[0]).toBe(skill.name);
  });

  test('returns null for non-existent job', async () => {
    const result = await updateJobHandler.handle(
      new UpdateJobCommand(9999999, { title: 'Ghost' })
    );
    expect(result).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('DeleteJobHandler', () => {
  test('deletes job from MySQL and removes view from MongoDB', async () => {
    const company = await fx.createCompany();
    companyId = company.id;
    const job = await fx.createJob(companyId);
    jobId = job.id;
    await syncJob(jobId);

    await deleteJobHandler.handle(new DeleteJobCommand(jobId));

    const doc = await JobView.findById(jobId).lean();
    expect(doc).toBeNull();
    jobId = null; // already deleted, skip cleanupJob
  });

  test('returns null for non-existent job', async () => {
    const result = await deleteJobHandler.handle(new DeleteJobCommand(9999999));
    expect(result).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GetJobByIdHandler — reads from MongoDB', () => {
  test('returns synced view from MongoDB', async () => {
    const company = await fx.createCompany({ name: 'Query Corp' });
    companyId = company.id;
    const job = await fx.createJob(companyId, { title: 'Findable Role' });
    jobId = job.id;
    await syncJob(jobId);

    const result = await getJobByIdHandler.handle(new GetJobByIdQuery(jobId));

    expect(result).not.toBeNull();
    expect(result.title).toBe('Findable Role');
    expect(result.company.name).toBe('Query Corp');
  });

  test('returns null for non-existent job view', async () => {
    const result = await getJobByIdHandler.handle(new GetJobByIdQuery(9999999));
    expect(result).toBeNull();
  });
});
