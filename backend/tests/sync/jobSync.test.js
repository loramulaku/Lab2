/**
 * jobSync integration tests
 *
 * Verify that syncJob() correctly projects MySQL Job + Company + Skills +
 * Categories into the JobView MongoDB collection.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const db      = require('../helpers/db');
const fx      = require('../helpers/fixtures');
const { syncJob } = require('../../src/sync/jobSync');
const JobSkill    = require('../../src/models/sql/JobSkill');
const JobCategory = require('../../src/models/sql/JobCategory');
const JobView     = require('../../src/models/nosql/JobView');

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

describe('jobSync — core job fields', () => {
  test('projects title, description, status, employmentType, workMode', async () => {
    const company = await fx.createCompany();
    companyId = company.id;
    const job = await fx.createJob(companyId, {
      title:          'Backend Engineer',
      description:    'Build APIs',
      employmentType: 'full-time',
      workMode:       'remote',
      status:         'open',
    });
    jobId = job.id;

    await syncJob(jobId);

    const doc = await JobView.findById(jobId).lean();
    expect(doc).not.toBeNull();
    expect(doc._id).toBe(jobId);
    expect(doc.title).toBe('Backend Engineer');
    expect(doc.description).toBe('Build APIs');
    expect(doc.employmentType).toBe('full-time');
    expect(doc.workMode).toBe('remote');
    expect(doc.status).toBe('open');
  });
});

describe('jobSync — company snapshot', () => {
  test('embeds company id, name, and website', async () => {
    const company = await fx.createCompany({
      name:    'HireFlow Inc',
      website: 'https://hireflow.example.com',
    });
    companyId = company.id;
    const job = await fx.createJob(companyId);
    jobId = job.id;

    await syncJob(jobId);

    const doc = await JobView.findById(jobId).lean();
    expect(doc.company.id).toBe(companyId);
    expect(doc.company.name).toBe('HireFlow Inc');
    expect(doc.company.website).toBe('https://hireflow.example.com');
  });
});

describe('jobSync — skills', () => {
  test('projects associated skill names as flat array', async () => {
    const company  = await fx.createCompany();
    companyId = company.id;
    const job      = await fx.createJob(companyId);
    jobId = job.id;
    const skillA   = await fx.createSkill(`Python_${Date.now()}`);
    const skillB   = await fx.createSkill(`Django_${Date.now()}`);
    await JobSkill.bulkCreate([
      { jobId, skillId: skillA.id },
      { jobId, skillId: skillB.id },
    ]);

    await syncJob(jobId);

    const doc = await JobView.findById(jobId).lean();
    expect(doc.skills).toHaveLength(2);
    expect(doc.skills).toEqual(expect.arrayContaining([skillA.name, skillB.name]));
  });

  test('skills is empty array when no skills attached', async () => {
    const company = await fx.createCompany();
    companyId = company.id;
    const job = await fx.createJob(companyId);
    jobId = job.id;

    await syncJob(jobId);

    const doc = await JobView.findById(jobId).lean();
    expect(doc.skills).toEqual([]);
  });
});

describe('jobSync — categories', () => {
  test('projects associated category names as flat array', async () => {
    const company = await fx.createCompany();
    companyId = company.id;
    const job     = await fx.createJob(companyId);
    jobId = job.id;
    const cat     = await fx.createCategory(`Engineering_${Date.now()}`);
    await JobCategory.create({ jobId, categoryId: cat.id });

    await syncJob(jobId);

    const doc = await JobView.findById(jobId).lean();
    expect(doc.categories).toContain(cat.name);
  });
});

describe('jobSync — upsert behaviour', () => {
  test('overwrites existing view on re-sync', async () => {
    const company = await fx.createCompany();
    companyId = company.id;
    const job = await fx.createJob(companyId, { title: 'Before' });
    jobId = job.id;
    await syncJob(jobId);

    await job.update({ title: 'After' });
    await syncJob(jobId);

    const doc = await JobView.findById(jobId).lean();
    expect(doc.title).toBe('After');
  });

  test('removes view when job is deleted', async () => {
    const company = await fx.createCompany();
    companyId = company.id;
    const job = await fx.createJob(companyId);
    jobId = job.id;
    await syncJob(jobId);

    await job.destroy();
    await syncJob(jobId);

    const doc = await JobView.findById(jobId).lean();
    expect(doc).toBeNull();
    jobId = null;
  });
});
