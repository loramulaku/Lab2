/**
 * User handler integration tests
 *
 * Each test:
 *  1. Creates MySQL data via fixtures (or calls RegisterUserHandler directly)
 *  2. Calls the handler (fires fire-and-forget sync internally)
 *  3. Awaits the relevant sync function explicitly to guarantee MongoDB is current
 *  4. Asserts the MongoDB read model reflects the change
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const db      = require('../helpers/db');
const fx      = require('../helpers/fixtures');
const { syncUser }      = require('../../src/sync/userSync');
const { syncCandidate } = require('../../src/sync/candidateSync');
const { syncRecruiter } = require('../../src/sync/recruiterSync');
const UserProfileView      = require('../../src/models/nosql/UserProfileView');
const CandidateProfileView = require('../../src/models/nosql/CandidateProfileView');
const RecruiterProfileView = require('../../src/models/nosql/RecruiterProfileView');

// Handlers
const registerUserHandler    = require('../../src/application/user/handlers/RegisterUserHandler');
const uploadAvatarHandler    = require('../../src/application/user/handlers/UploadAvatarHandler');
const getUserProfileHandler  = require('../../src/application/user/handlers/GetUserProfileHandler');

// Commands / Queries
const RegisterUserCommand  = require('../../src/application/user/commands/RegisterUser.command');
const UploadAvatarCommand  = require('../../src/application/user/commands/UploadAvatar.command');
const GetUserProfileQuery  = require('../../src/application/user/queries/GetUserProfile.query');

let userId;

beforeAll(() => db.connect());
afterAll(() => db.disconnect());

afterEach(async () => {
  await fx.cleanupUser(userId);
  userId = null;
});

// ─────────────────────────────────────────────────────────────────────────────
describe('RegisterUserHandler', () => {
  test('registers candidate and syncs UserProfileView + CandidateProfileView', async () => {
    const email = fx.uniqueEmail();

    const dto = await registerUserHandler.handle(
      new RegisterUserCommand({
        firstName: 'Alice',
        lastName:  'Cand',
        email,
        password:  'Secret123!',
        role:      'candidate',
      })
    );
    userId = dto.id;

    await syncUser(userId);
    await syncCandidate(userId);

    const userDoc      = await UserProfileView.findById(userId).lean();
    const candidateDoc = await CandidateProfileView.findById(userId).lean();

    expect(userDoc).not.toBeNull();
    expect(userDoc.firstName).toBe('Alice');
    expect(userDoc.roles).toContain('candidate');

    expect(candidateDoc).not.toBeNull();
    expect(candidateDoc.firstName).toBe('Alice');
    expect(candidateDoc.email).toBe(email);
  });

  test('registers recruiter and syncs UserProfileView + RecruiterProfileView', async () => {
    const email = fx.uniqueEmail();

    const dto = await registerUserHandler.handle(
      new RegisterUserCommand({
        firstName: 'Bob',
        lastName:  'Rec',
        email,
        password:  'Secret123!',
        role:      'recruiter',
      })
    );
    userId = dto.id;

    await syncUser(userId);
    await syncRecruiter(userId);

    const userDoc      = await UserProfileView.findById(userId).lean();
    const recruiterDoc = await RecruiterProfileView.findById(userId).lean();

    expect(userDoc.roles).toContain('recruiter');
    expect(recruiterDoc).not.toBeNull();
    expect(recruiterDoc.firstName).toBe('Bob');
  });

  test('throws 409 when email already registered', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await expect(
      registerUserHandler.handle(
        new RegisterUserCommand({
          firstName: 'Dup',
          lastName:  'User',
          email:     user.email,
          password:  'Secret123!',
          role:      'candidate',
        })
      )
    ).rejects.toMatchObject({ status: 409 });
  });

  test('unknown role defaults to candidate', async () => {
    const email = fx.uniqueEmail();

    const dto = await registerUserHandler.handle(
      new RegisterUserCommand({
        firstName: 'Default',
        lastName:  'Role',
        email,
        password:  'Secret123!',
        role:      'supervillain',
      })
    );
    userId = dto.id;

    await syncUser(userId);

    const doc = await UserProfileView.findById(userId).lean();
    expect(doc.roles).toContain('candidate');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('UploadAvatarHandler', () => {
  test('sets avatarPath and syncs CandidateProfileView', async () => {
    const user = await fx.createUser();
    userId = user.id;
    await fx.assignRole(userId, 'candidate');

    await uploadAvatarHandler.handle(
      new UploadAvatarCommand({
        userId,
        avatarPath: '/uploads/avatars/alice.png',
        roles:      ['candidate'],
      })
    );
    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.avatarPath).toBe('/uploads/avatars/alice.png');
  });

  test('sets avatarPath and syncs RecruiterProfileView', async () => {
    const user    = await fx.createUser();
    userId = user.id;
    const company = await fx.createCompany();
    await fx.assignRole(userId, 'recruiter');
    await fx.createRecruiterProfile(userId, company.id);

    await uploadAvatarHandler.handle(
      new UploadAvatarCommand({
        userId,
        avatarPath: '/uploads/avatars/bob.png',
        roles:      ['recruiter'],
      })
    );
    await syncRecruiter(userId);

    const doc = await RecruiterProfileView.findById(userId).lean();
    expect(doc.avatarPath).toBe('/uploads/avatars/bob.png');
  });

  test('updating avatar overwrites previous avatarPath', async () => {
    const user = await fx.createUser({ avatarPath: '/uploads/avatars/old.png' });
    userId = user.id;

    await uploadAvatarHandler.handle(
      new UploadAvatarCommand({
        userId,
        avatarPath: '/uploads/avatars/new.png',
        roles:      ['candidate'],
      })
    );
    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.avatarPath).toBe('/uploads/avatars/new.png');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GetUserProfileHandler — reads from MongoDB', () => {
  test('returns synced UserProfileView from MongoDB', async () => {
    const user = await fx.createUser({ firstName: 'Read', lastName: 'Me' });
    userId = user.id;
    await fx.assignRole(userId, 'candidate');
    await syncUser(userId);

    const result = await getUserProfileHandler.handle(new GetUserProfileQuery(userId));

    expect(result).not.toBeNull();
    expect(result.firstName).toBe('Read');
    expect(result.roles).toContain('candidate');
  });

  test('returns null on cache miss (no view synced yet)', async () => {
    const user = await fx.createUser();
    userId = user.id;

    const result = await getUserProfileHandler.handle(new GetUserProfileQuery(userId));

    expect(result).toBeNull();
  });

  test('reflects updates after re-sync', async () => {
    const user = await fx.createUser({ firstName: 'Before' });
    userId = user.id;
    await syncUser(userId);

    await user.update({ firstName: 'After' });
    await syncUser(userId);

    const result = await getUserProfileHandler.handle(new GetUserProfileQuery(userId));
    expect(result.firstName).toBe('After');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Regression: cross-view consistency
// ─────────────────────────────────────────────────────────────────────────────
describe('cross-view consistency — UploadAvatarHandler keeps UserProfileView in sync', () => {
  test('avatarPath is reflected in UserProfileView after upload (candidate)', async () => {
    const user = await fx.createUser();
    userId = user.id;
    await syncUser(userId); // seed UserProfileView

    await uploadAvatarHandler.handle(
      new UploadAvatarCommand({ userId, avatarPath: '/avatars/sync-test.png', roles: ['candidate'] })
    );
    await syncUser(userId); // flush the safe fire-and-forget

    const doc = await UserProfileView.findById(userId).lean();
    expect(doc.avatarPath).toBe('/avatars/sync-test.png');
  });

  test('avatarPath is reflected in UserProfileView after upload (recruiter)', async () => {
    const user = await fx.createUser();
    userId = user.id;
    await syncUser(userId);

    await uploadAvatarHandler.handle(
      new UploadAvatarCommand({ userId, avatarPath: '/avatars/rec-test.png', roles: ['recruiter'] })
    );
    await syncUser(userId);

    const doc = await UserProfileView.findById(userId).lean();
    expect(doc.avatarPath).toBe('/avatars/rec-test.png');
  });
});
