/**
 * recruiterSync integration tests
 *
 * Verify that syncRecruiter() correctly projects MySQL User + RecruiterProfile +
 * Company into the RecruiterProfileView MongoDB collection.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const db      = require('../helpers/db');
const fx      = require('../helpers/fixtures');
const { syncRecruiter } = require('../../src/sync/recruiterSync');
const RecruiterProfileView = require('../../src/models/nosql/RecruiterProfileView');

let userId;
let companyId;

beforeAll(() => db.connect());
afterAll(() => db.disconnect());

afterEach(async () => {
  await fx.cleanupUser(userId);
  userId    = null;
  companyId = null;
});

describe('recruiterSync — user fields', () => {
  test('projects firstName, lastName, email, avatarPath', async () => {
    const user = await fx.createUser({
      firstName:  'Bob',
      lastName:   'Recruiter',
      avatarPath: '/uploads/avatars/bob.png',
    });
    userId = user.id;

    await syncRecruiter(userId);

    const doc = await RecruiterProfileView.findById(userId).lean();
    expect(doc).not.toBeNull();
    expect(doc._id).toBe(userId);
    expect(doc.firstName).toBe('Bob');
    expect(doc.lastName).toBe('Recruiter');
    expect(doc.email).toBe(user.email);
    expect(doc.avatarPath).toBe('/uploads/avatars/bob.png');
  });
});

describe('recruiterSync — recruiter profile fields', () => {
  test('projects jobTitle, phone, linkedinUrl', async () => {
    const user    = await fx.createUser();
    userId = user.id;
    const company = await fx.createCompany();
    companyId = company.id;
    await fx.createRecruiterProfile(userId, companyId, {
      jobTitle:    'Talent Lead',
      phone:       '+44 20 0000 0000',
      linkedinUrl: 'https://linkedin.com/in/bob',
    });

    await syncRecruiter(userId);

    const doc = await RecruiterProfileView.findById(userId).lean();
    expect(doc.jobTitle).toBe('Talent Lead');
    expect(doc.phone).toBe('+44 20 0000 0000');
    expect(doc.linkedinUrl).toBe('https://linkedin.com/in/bob');
  });

  test('recruiter fields are null when no profile exists', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await syncRecruiter(userId);

    const doc = await RecruiterProfileView.findById(userId).lean();
    expect(doc.jobTitle).toBeNull();
    expect(doc.phone).toBeNull();
    expect(doc.linkedinUrl).toBeNull();
    expect(doc.company).toBeNull();
  });
});

describe('recruiterSync — company snapshot', () => {
  test('projects all company fields into embedded company object', async () => {
    const user    = await fx.createUser();
    userId = user.id;
    const company = await fx.createCompany({
      name:        'Acme Corp',
      industry:    'Technology',
      location:    'San Francisco',
      size:        '51-200',
      foundedYear: 2015,
      website:     'https://acme.example.com',
      description: 'Great company',
      logoPath:    '/uploads/logos/acme.png',
    });
    companyId = company.id;
    await fx.createRecruiterProfile(userId, companyId);

    await syncRecruiter(userId);

    const doc = await RecruiterProfileView.findById(userId).lean();
    expect(doc.company).not.toBeNull();
    expect(doc.company.id).toBe(companyId);
    expect(doc.company.name).toBe('Acme Corp');
    expect(doc.company.industry).toBe('Technology');
    expect(doc.company.location).toBe('San Francisco');
    expect(doc.company.size).toBe('51-200');
    expect(doc.company.foundedYear).toBe(2015);
    expect(doc.company.website).toBe('https://acme.example.com');
    expect(doc.company.description).toBe('Great company');
    expect(doc.company.logoPath).toBe('/uploads/logos/acme.png');
  });

  test('company is null when recruiter has no company yet', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await syncRecruiter(userId);

    const doc = await RecruiterProfileView.findById(userId).lean();
    expect(doc.company).toBeNull();
  });
});

describe('recruiterSync — upsert behaviour', () => {
  test('overwrites existing view on re-sync', async () => {
    const user    = await fx.createUser();
    userId = user.id;
    const company = await fx.createCompany({ name: 'Before Corp' });
    companyId = company.id;
    await fx.createRecruiterProfile(userId, companyId, { jobTitle: 'Before' });
    await syncRecruiter(userId);

    await company.update({ name: 'After Corp' });
    await syncRecruiter(userId);

    const doc = await RecruiterProfileView.findById(userId).lean();
    expect(doc.company.name).toBe('After Corp');
  });

  test('removes view when user is deleted', async () => {
    const user = await fx.createUser();
    userId = user.id;
    await syncRecruiter(userId);

    await user.destroy();
    await syncRecruiter(userId);

    const doc = await RecruiterProfileView.findById(userId).lean();
    expect(doc).toBeNull();
    userId = null;
  });
});
