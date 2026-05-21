/**
 * userSync integration tests
 *
 * Verify that syncUser() correctly projects MySQL User + Roles data
 * into the UserProfileView MongoDB collection.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const db      = require('../helpers/db');
const fx      = require('../helpers/fixtures');
const { syncUser } = require('../../src/sync/userSync');
const UserProfileView = require('../../src/models/nosql/UserProfileView');

let userId;

beforeAll(() => db.connect());
afterAll(() => db.disconnect());

afterEach(async () => {
  await fx.cleanupUser(userId);
  userId = null;
});

describe('userSync — core user fields', () => {
  test('projects firstName, lastName, email, isActive to UserProfileView', async () => {
    const user = await fx.createUser({ firstName: 'Alice', lastName: 'Smith' });
    userId = user.id;

    await syncUser(userId);

    const doc = await UserProfileView.findById(userId).lean();
    expect(doc).not.toBeNull();
    expect(doc._id).toBe(userId);
    expect(doc.firstName).toBe('Alice');
    expect(doc.lastName).toBe('Smith');
    expect(doc.email).toBe(user.email);
    expect(doc.isActive).toBe(true);
  });

  test('projects avatarPath when set', async () => {
    const user = await fx.createUser({ avatarPath: '/uploads/avatars/test.png' });
    userId = user.id;

    await syncUser(userId);

    const doc = await UserProfileView.findById(userId).lean();
    expect(doc.avatarPath).toBe('/uploads/avatars/test.png');
  });

  test('avatarPath is null when not set', async () => {
    const user = await fx.createUser({ avatarPath: null });
    userId = user.id;

    await syncUser(userId);

    const doc = await UserProfileView.findById(userId).lean();
    expect(doc.avatarPath).toBeNull();
  });
});

describe('userSync — roles', () => {
  test('projects assigned roles array', async () => {
    const user = await fx.createUser();
    userId = user.id;
    await fx.assignRole(userId, 'candidate');

    await syncUser(userId);

    const doc = await UserProfileView.findById(userId).lean();
    expect(doc.roles).toContain('candidate');
    expect(doc.roles).toHaveLength(1);
  });

  test('projects multiple roles', async () => {
    const user = await fx.createUser();
    userId = user.id;
    await fx.assignRole(userId, 'candidate');
    await fx.assignRole(userId, 'recruiter');

    await syncUser(userId);

    const doc = await UserProfileView.findById(userId).lean();
    expect(doc.roles).toContain('candidate');
    expect(doc.roles).toContain('recruiter');
    expect(doc.roles).toHaveLength(2);
  });

  test('roles is empty array when no roles assigned', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await syncUser(userId);

    const doc = await UserProfileView.findById(userId).lean();
    expect(doc.roles).toEqual([]);
  });
});

describe('userSync — upsert behaviour', () => {
  test('overwrites existing UserProfileView on re-sync', async () => {
    const user = await fx.createUser({ firstName: 'Before' });
    userId = user.id;
    await syncUser(userId);

    await user.update({ firstName: 'After' });
    await syncUser(userId);

    const doc = await UserProfileView.findById(userId).lean();
    expect(doc.firstName).toBe('After');
  });

  test('removes view when user is deleted', async () => {
    const user = await fx.createUser();
    userId = user.id;
    await syncUser(userId);

    await user.destroy();
    await syncUser(userId);

    const doc = await UserProfileView.findById(userId).lean();
    expect(doc).toBeNull();
    userId = null; // already deleted
  });
});
