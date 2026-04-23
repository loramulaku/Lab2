/**
 * Candidate handler integration tests
 *
 * Each test:
 *  1. Creates MySQL data via fixtures
 *  2. Calls the handler (fires fire-and-forget sync internally)
 *  3. Awaits syncCandidate() explicitly to guarantee MongoDB is current
 *  4. Asserts the MongoDB read model reflects the change
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const db      = require('../helpers/db');
const fx      = require('../helpers/fixtures');
const { syncCandidate } = require('../../src/sync/candidateSync');
const { syncUser }      = require('../../src/sync/userSync');
const CandidateProfileView = require('../../src/models/nosql/CandidateProfileView');
const UserProfileView      = require('../../src/models/nosql/UserProfileView');

// Handlers
const updateCandidateProfileHandler = require('../../src/application/candidate/handlers/UpdateCandidateProfileHandler');
const addSkillHandler                = require('../../src/application/candidate/handlers/AddSkillHandler');
const deleteSkillHandler             = require('../../src/application/candidate/handlers/DeleteSkillHandler');
const addExperienceHandler           = require('../../src/application/candidate/handlers/AddExperienceHandler');
const updateExperienceHandler        = require('../../src/application/candidate/handlers/UpdateExperienceHandler');
const deleteExperienceHandler        = require('../../src/application/candidate/handlers/DeleteExperienceHandler');
const addEducationHandler            = require('../../src/application/candidate/handlers/AddEducationHandler');
const updateEducationHandler         = require('../../src/application/candidate/handlers/UpdateEducationHandler');
const deleteEducationHandler         = require('../../src/application/candidate/handlers/DeleteEducationHandler');
const getCandidateProfileHandler     = require('../../src/application/candidate/handlers/GetCandidateProfileHandler');

// Commands / Queries
const UpdateCandidateProfileCommand = require('../../src/application/candidate/commands/UpdateCandidateProfile.command');
const AddSkillCommand                = require('../../src/application/candidate/commands/AddSkill.command');
const DeleteSkillCommand             = require('../../src/application/candidate/commands/DeleteSkill.command');
const AddExperienceCommand           = require('../../src/application/candidate/commands/AddExperience.command');
const UpdateExperienceCommand        = require('../../src/application/candidate/commands/UpdateExperience.command');
const DeleteExperienceCommand        = require('../../src/application/candidate/commands/DeleteExperience.command');
const AddEducationCommand            = require('../../src/application/candidate/commands/AddEducation.command');
const UpdateEducationCommand         = require('../../src/application/candidate/commands/UpdateEducation.command');
const DeleteEducationCommand         = require('../../src/application/candidate/commands/DeleteEducation.command');
const GetCandidateProfileQuery       = require('../../src/application/candidate/queries/GetCandidateProfile.query');

let userId;

beforeAll(() => db.connect());
afterAll(() => db.disconnect());

afterEach(async () => {
  await fx.cleanupUser(userId);
  userId = null;
});

// ─────────────────────────────────────────────────────────────────────────────
describe('UpdateCandidateProfileHandler', () => {
  test('updates user name + profile fields and syncs to MongoDB', async () => {
    const user = await fx.createUser({ firstName: 'Old', lastName: 'Name' });
    userId = user.id;

    await updateCandidateProfileHandler.handle(
      new UpdateCandidateProfileCommand({
        userId,
        firstName: 'New',
        lastName:  'Name',
        headline:  'Senior Dev',
        bio:       'Loves tests',
        location:  'Berlin',
      })
    );
    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.firstName).toBe('New');
    expect(doc.headline).toBe('Senior Dev');
    expect(doc.bio).toBe('Loves tests');
    expect(doc.location).toBe('Berlin');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('AddSkillHandler', () => {
  test('adds skill and syncs to MongoDB', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await addSkillHandler.handle(
      new AddSkillCommand({ userId, name: `Go_${Date.now()}`, level: 'Expert' })
    );
    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.skills).toHaveLength(1);
    expect(doc.skills[0].level).toBe('Expert');
  });

  test('defaults unknown level to Intermediate', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await addSkillHandler.handle(
      new AddSkillCommand({ userId, name: `Rust_${Date.now()}`, level: 'Ninja' })
    );
    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.skills[0].level).toBe('Intermediate');
  });

  test('throws 409 when skill already added', async () => {
    const user  = await fx.createUser();
    userId = user.id;
    const skill = await fx.createSkill(`Unique_${Date.now()}`);
    await fx.addCandidateSkill(userId, skill.id);

    await expect(
      addSkillHandler.handle(new AddSkillCommand({ userId, name: skill.name }))
    ).rejects.toMatchObject({ status: 409 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('DeleteSkillHandler', () => {
  test('removes skill and syncs MongoDB — skill absent after delete', async () => {
    const user  = await fx.createUser();
    userId = user.id;
    const skill = await fx.createSkill(`Kotlin_${Date.now()}`);
    const cs    = await fx.addCandidateSkill(userId, skill.id);

    await deleteSkillHandler.handle(
      new DeleteSkillCommand({ userId, skillId: cs.id })
    );
    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.skills).toHaveLength(0);
  });

  test('throws 404 for non-existent skill entry', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await expect(
      deleteSkillHandler.handle(new DeleteSkillCommand({ userId, skillId: 9999999 }))
    ).rejects.toMatchObject({ status: 404 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('AddExperienceHandler', () => {
  test('adds experience and syncs to MongoDB', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await addExperienceHandler.handle(
      new AddExperienceCommand({
        userId,
        title:       'Lead Engineer',
        company:     'StartupX',
        startDate:   '2020-03-01',
        endDate:     '2022-12-31',
        description: 'Built things',
      })
    );
    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.experiences).toHaveLength(1);
    expect(doc.experiences[0].title).toBe('Lead Engineer');
    expect(doc.experiences[0].company).toBe('StartupX');
    expect(doc.experiences[0].endDate).toBe('2022-12-31');
  });

  test('endDate is null for current positions', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await addExperienceHandler.handle(
      new AddExperienceCommand({ userId, title: 'Dev', company: 'Acme', startDate: '2023-01-01' })
    );
    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.experiences[0].endDate).toBeNull();
  });

  test('throws 400 when required fields missing', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await expect(
      addExperienceHandler.handle(new AddExperienceCommand({ userId, title: 'Dev' }))
    ).rejects.toMatchObject({ status: 400 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('UpdateExperienceHandler', () => {
  test('updates experience and syncs to MongoDB', async () => {
    const user = await fx.createUser();
    userId = user.id;
    const exp  = await fx.createExperience(userId, { title: 'Junior Dev' });

    await updateExperienceHandler.handle(
      new UpdateExperienceCommand({
        userId,
        experienceId: exp.id,
        title:        'Senior Dev',
        company:      exp.company,
        startDate:    exp.startDate,
      })
    );
    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.experiences[0].title).toBe('Senior Dev');
  });

  test('throws 404 for non-existent experience', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await expect(
      updateExperienceHandler.handle(
        new UpdateExperienceCommand({ userId, experienceId: 9999999, title: 'X', company: 'Y', startDate: '2020-01-01' })
      )
    ).rejects.toMatchObject({ status: 404 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('DeleteExperienceHandler', () => {
  test('removes experience and syncs to MongoDB', async () => {
    const user = await fx.createUser();
    userId = user.id;
    const exp  = await fx.createExperience(userId);

    await deleteExperienceHandler.handle(
      new DeleteExperienceCommand({ userId, experienceId: exp.id })
    );
    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.experiences).toHaveLength(0);
  });

  test('throws 404 for non-existent experience', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await expect(
      deleteExperienceHandler.handle(new DeleteExperienceCommand({ userId, experienceId: 9999999 }))
    ).rejects.toMatchObject({ status: 404 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('AddEducationHandler', () => {
  test('adds education and syncs to MongoDB', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await addEducationHandler.handle(
      new AddEducationCommand({
        userId,
        degree:      'PhD Computer Science',
        institution: 'MIT',
        startYear:   2018,
        endYear:     2023,
      })
    );
    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.educations).toHaveLength(1);
    expect(doc.educations[0].degree).toBe('PhD Computer Science');
    expect(doc.educations[0].institution).toBe('MIT');
    expect(doc.educations[0].startYear).toBe(2018);
  });

  test('throws 400 when required fields missing', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await expect(
      addEducationHandler.handle(new AddEducationCommand({ userId, degree: 'BSc' }))
    ).rejects.toMatchObject({ status: 400 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('UpdateEducationHandler', () => {
  test('updates education and syncs to MongoDB', async () => {
    const user = await fx.createUser();
    userId = user.id;
    const edu  = await fx.createEducation(userId, { degree: 'BSc CS' });

    await updateEducationHandler.handle(
      new UpdateEducationCommand({
        userId,
        educationId: edu.id,
        degree:      'MSc CS',
        institution: edu.institution,
        startYear:   edu.startYear,
        endYear:     edu.endYear,
      })
    );
    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.educations[0].degree).toBe('MSc CS');
  });

  test('throws 404 for non-existent education', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await expect(
      updateEducationHandler.handle(
        new UpdateEducationCommand({ userId, educationId: 9999999, degree: 'X', institution: 'Y', startYear: 2020 })
      )
    ).rejects.toMatchObject({ status: 404 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('DeleteEducationHandler', () => {
  test('removes education and syncs to MongoDB', async () => {
    const user = await fx.createUser();
    userId = user.id;
    const edu  = await fx.createEducation(userId);

    await deleteEducationHandler.handle(
      new DeleteEducationCommand({ userId, educationId: edu.id })
    );
    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.educations).toHaveLength(0);
  });

  test('throws 404 for non-existent education', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await expect(
      deleteEducationHandler.handle(new DeleteEducationCommand({ userId, educationId: 9999999 }))
    ).rejects.toMatchObject({ status: 404 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GetCandidateProfileHandler — reads from MongoDB', () => {
  test('returns synced view from MongoDB', async () => {
    const user = await fx.createUser({ firstName: 'Read', lastName: 'Test' });
    userId = user.id;
    await fx.createCandidateProfile(userId, { headline: 'Query Dev' });
    await syncCandidate(userId);

    const result = await getCandidateProfileHandler.handle(
      new GetCandidateProfileQuery(userId)
    );

    expect(result).not.toBeNull();
    expect(result.firstName).toBe('Read');
    expect(result.headline).toBe('Query Dev');
  });

  test('returns null when no view exists', async () => {
    const user = await fx.createUser();
    userId = user.id;

    const result = await getCandidateProfileHandler.handle(
      new GetCandidateProfileQuery(userId)
    );

    // cache-miss returns null (sync is triggered in background)
    expect(result).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Regression: cross-view consistency
// ─────────────────────────────────────────────────────────────────────────────
describe('cross-view consistency — UpdateCandidateProfileHandler keeps UserProfileView in sync', () => {
  test('firstName/lastName change is reflected in UserProfileView', async () => {
    const user = await fx.createUser({ firstName: 'Before', lastName: 'Old' });
    userId = user.id;
    await syncUser(userId); // seed UserProfileView with initial name

    await updateCandidateProfileHandler.handle(
      new UpdateCandidateProfileCommand({
        userId,
        firstName: 'After',
        lastName:  'New',
        headline:  'Dev',
        bio:       null,
        location:  null,
      })
    );
    // Flush the fire-and-forget syncUserSafe call
    await syncUser(userId);

    const doc = await UserProfileView.findById(userId).lean();
    expect(doc.firstName).toBe('After');
    expect(doc.lastName).toBe('New');
  });

  test('CandidateProfileView and UserProfileView are consistent after name change', async () => {
    const user = await fx.createUser({ firstName: 'Sync', lastName: 'Test' });
    userId = user.id;

    await updateCandidateProfileHandler.handle(
      new UpdateCandidateProfileCommand({
        userId,
        firstName: 'Updated',
        lastName:  'Name',
        headline:  'Engineer',
        bio:       'Bio text',
        location:  'NYC',
      })
    );
    await syncCandidate(userId);
    await syncUser(userId);

    const candidateDoc = await CandidateProfileView.findById(userId).lean();
    const userDoc      = await UserProfileView.findById(userId).lean();

    // Both views must agree on the name
    expect(candidateDoc.firstName).toBe('Updated');
    expect(userDoc.firstName).toBe('Updated');
    expect(candidateDoc.lastName).toBe('Name');
    expect(userDoc.lastName).toBe('Name');
  });
});
