/**
 * Recruiter handler integration tests
 *
 * Each test:
 *  1. Creates MySQL data via fixtures
 *  2. Calls the handler (fires fire-and-forget sync internally)
 *  3. Awaits syncRecruiter() explicitly to guarantee MongoDB is current
 *  4. Asserts the MongoDB read model reflects the change
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const db      = require('../helpers/db');
const fx      = require('../helpers/fixtures');
const { syncRecruiter } = require('../../src/sync/recruiterSync');
const RecruiterProfileView = require('../../src/models/nosql/RecruiterProfileView');

// Handlers
const setupRecruiterHandler      = require('../../src/application/recruiter/handlers/SetupRecruiterHandler');
const uploadLogoHandler          = require('../../src/application/recruiter/handlers/UploadLogoHandler');
const getRecruiterProfileHandler = require('../../src/application/recruiter/handlers/GetRecruiterProfileHandler');

// Commands / Queries
const SetupRecruiterCommand    = require('../../src/application/recruiter/commands/SetupRecruiter.command');
const UploadLogoCommand        = require('../../src/application/recruiter/commands/UploadLogo.command');
const GetRecruiterProfileQuery = require('../../src/application/recruiter/queries/GetRecruiterProfile.query');

let userId;
let companyId;

beforeAll(() => db.connect());
afterAll(() => db.disconnect());

afterEach(async () => {
  await fx.cleanupUser(userId);
  userId    = null;
  companyId = null;
});

// ─────────────────────────────────────────────────────────────────────────────
describe('SetupRecruiterHandler — create profile', () => {
  test('creates company + profile and syncs all fields to MongoDB', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await setupRecruiterHandler.handle(
      new SetupRecruiterCommand({
        userId,
        companyName: 'TechCorp',
        industry:    'Software',
        location:    'London',
        size:        '11-50',
        foundedYear: 2018,
        website:     'https://techcorp.example.com',
        description: 'Building the future',
        jobTitle:    'Head of Talent',
        phone:       '+44 20 1234 5678',
        linkedinUrl: 'https://linkedin.com/in/recruiter',
      })
    );
    await syncRecruiter(userId);

    const doc = await RecruiterProfileView.findById(userId).lean();
    expect(doc).not.toBeNull();
    expect(doc.jobTitle).toBe('Head of Talent');
    expect(doc.phone).toBe('+44 20 1234 5678');
    expect(doc.linkedinUrl).toBe('https://linkedin.com/in/recruiter');
    expect(doc.company).not.toBeNull();
    expect(doc.company.name).toBe('TechCorp');
    expect(doc.company.industry).toBe('Software');
    expect(doc.company.location).toBe('London');
    expect(doc.company.size).toBe('11-50');
    expect(doc.company.foundedYear).toBe(2018);
    expect(doc.company.website).toBe('https://techcorp.example.com');
    expect(doc.company.description).toBe('Building the future');
  });

  test('updates existing company on re-setup', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await setupRecruiterHandler.handle(
      new SetupRecruiterCommand({ userId, companyName: 'OldName Inc' })
    );
    await syncRecruiter(userId);

    await setupRecruiterHandler.handle(
      new SetupRecruiterCommand({ userId, companyName: 'NewName Ltd' })
    );
    await syncRecruiter(userId);

    const doc = await RecruiterProfileView.findById(userId).lean();
    expect(doc.company.name).toBe('NewName Ltd');
  });

  test('throws 400 when companyName is missing', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await expect(
      setupRecruiterHandler.handle(new SetupRecruiterCommand({ userId, companyName: '' }))
    ).rejects.toMatchObject({ status: 400 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('UploadLogoHandler', () => {
  test('updates company logoPath and syncs to MongoDB', async () => {
    const user    = await fx.createUser();
    userId = user.id;
    const company = await fx.createCompany();
    companyId = company.id;
    await fx.createRecruiterProfile(userId, companyId);

    await uploadLogoHandler.handle(
      new UploadLogoCommand({ userId, logoPath: '/uploads/logos/new_logo.png' })
    );
    await syncRecruiter(userId);

    const doc = await RecruiterProfileView.findById(userId).lean();
    expect(doc.company.logoPath).toBe('/uploads/logos/new_logo.png');
  });

  test('does nothing when recruiter has no company', async () => {
    const user = await fx.createUser();
    userId = user.id;

    // No profile → uploadLogo should not throw, just no-op
    const result = await uploadLogoHandler.handle(
      new UploadLogoCommand({ userId, logoPath: '/some/path.png' })
    );
    expect(result).toEqual({ path: '/some/path.png' });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GetRecruiterProfileHandler — reads from MongoDB', () => {
  test('returns synced view from MongoDB', async () => {
    const user    = await fx.createUser({ firstName: 'Bob', lastName: 'Recruiter' });
    userId = user.id;
    const company = await fx.createCompany({ name: 'ReadCorp' });
    companyId = company.id;
    await fx.createRecruiterProfile(userId, companyId, { jobTitle: 'VP Talent' });
    await syncRecruiter(userId);

    const result = await getRecruiterProfileHandler.handle(
      new GetRecruiterProfileQuery(userId)
    );

    expect(result).not.toBeNull();
    expect(result.firstName).toBe('Bob');
    expect(result.jobTitle).toBe('VP Talent');
    expect(result.company.name).toBe('ReadCorp');
  });

  test('returns null for non-existent view (cache miss)', async () => {
    const user = await fx.createUser();
    userId = user.id;

    const result = await getRecruiterProfileHandler.handle(
      new GetRecruiterProfileQuery(userId)
    );

    expect(result).toBeNull();
  });
});
