/**
 * candidateSync integration tests
 *
 * Verify that syncCandidate() correctly projects MySQL User + CandidateProfile +
 * Skills + Experiences + Educations into the CandidateProfileView MongoDB collection.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const db      = require('../helpers/db');
const fx      = require('../helpers/fixtures');
const { syncCandidate } = require('../../src/sync/candidateSync');
const CandidateProfileView = require('../../src/models/nosql/CandidateProfileView');

let userId;

beforeAll(() => db.connect());
afterAll(() => db.disconnect());

afterEach(async () => {
  await fx.cleanupUser(userId);
  userId = null;
});

describe('candidateSync — user fields', () => {
  test('projects firstName, lastName, email, avatarPath', async () => {
    const user = await fx.createUser({
      firstName:  'Jane',
      lastName:   'Doe',
      avatarPath: '/uploads/avatars/jane.png',
    });
    userId = user.id;

    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc).not.toBeNull();
    expect(doc._id).toBe(userId);
    expect(doc.firstName).toBe('Jane');
    expect(doc.lastName).toBe('Doe');
    expect(doc.email).toBe(user.email);
    expect(doc.avatarPath).toBe('/uploads/avatars/jane.png');
  });
});

describe('candidateSync — profile fields', () => {
  test('projects headline, bio, location from CandidateProfile', async () => {
    const user = await fx.createUser();
    userId = user.id;
    await fx.createCandidateProfile(userId, {
      headline: 'Full-Stack Dev',
      bio:      'Loves clean code',
      location: 'Berlin',
    });

    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.headline).toBe('Full-Stack Dev');
    expect(doc.bio).toBe('Loves clean code');
    expect(doc.location).toBe('Berlin');
  });

  test('profile fields are null when no CandidateProfile exists', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.headline).toBeNull();
    expect(doc.bio).toBeNull();
    expect(doc.location).toBeNull();
  });
});

describe('candidateSync — skills', () => {
  test('projects skill name and level', async () => {
    const user  = await fx.createUser();
    userId = user.id;
    const skill = await fx.createSkill('TypeScript');
    await fx.addCandidateSkill(userId, skill.id, 'Advanced');

    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.skills).toHaveLength(1);
    expect(doc.skills[0].name).toBe('TypeScript');
    expect(doc.skills[0].level).toBe('Advanced');
    expect(doc.skills[0].skillId).toBe(skill.id);
  });

  test('projects multiple skills', async () => {
    const user   = await fx.createUser();
    userId = user.id;
    const skill1 = await fx.createSkill(`React_${Date.now()}`);
    const skill2 = await fx.createSkill(`Node_${Date.now()}`);
    await fx.addCandidateSkill(userId, skill1.id, 'Expert');
    await fx.addCandidateSkill(userId, skill2.id, 'Intermediate');

    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.skills).toHaveLength(2);
    expect(doc.skills.map(s => s.name)).toEqual(expect.arrayContaining([skill1.name, skill2.name]));
  });

  test('skills is empty array when no skills added', async () => {
    const user = await fx.createUser();
    userId = user.id;

    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.skills).toEqual([]);
  });
});

describe('candidateSync — experiences', () => {
  test('projects experience entries in correct shape', async () => {
    const user = await fx.createUser();
    userId = user.id;
    await fx.createExperience(userId, {
      title:       'Senior Developer',
      company:     'TechCorp',
      startDate:   '2021-06-01',
      endDate:     '2023-12-31',
      description: 'Led backend team',
    });

    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.experiences).toHaveLength(1);
    const exp = doc.experiences[0];
    expect(exp.title).toBe('Senior Developer');
    expect(exp.company).toBe('TechCorp');
    expect(exp.startDate).toBe('2021-06-01');
    expect(exp.endDate).toBe('2023-12-31');
    expect(exp.description).toBe('Led backend team');
  });

  test('endDate is null for current positions', async () => {
    const user = await fx.createUser();
    userId = user.id;
    await fx.createExperience(userId, { endDate: null });

    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.experiences[0].endDate).toBeNull();
  });
});

describe('candidateSync — educations', () => {
  test('projects education entries in correct shape', async () => {
    const user = await fx.createUser();
    userId = user.id;
    await fx.createEducation(userId, {
      degree:      'MSc Data Science',
      institution: 'Tech University',
      startYear:   2019,
      endYear:     2021,
    });

    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.educations).toHaveLength(1);
    const edu = doc.educations[0];
    expect(edu.degree).toBe('MSc Data Science');
    expect(edu.institution).toBe('Tech University');
    expect(edu.startYear).toBe(2019);
    expect(edu.endYear).toBe(2021);
  });
});

describe('candidateSync — stats', () => {
  test('stats counts match actual data', async () => {
    const user = await fx.createUser();
    userId = user.id;
    const s1 = await fx.createSkill(`s1_${Date.now()}`);
    const s2 = await fx.createSkill(`s2_${Date.now()}`);
    await fx.addCandidateSkill(userId, s1.id);
    await fx.addCandidateSkill(userId, s2.id);
    await fx.createExperience(userId);
    await fx.createEducation(userId);

    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.stats.skillsListed).toBe(2);
    expect(doc.stats.workExperiences).toBe(1);
    expect(doc.stats.educationRecords).toBe(1);
  });
});

describe('candidateSync — upsert behaviour', () => {
  test('overwrites existing view on re-sync', async () => {
    const user = await fx.createUser();
    userId = user.id;
    await fx.createCandidateProfile(userId, { headline: 'Before' });
    await syncCandidate(userId);

    await fx.createCandidateProfile(userId, { headline: 'After' });
    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc.headline).toBe('After');
  });

  test('removes view when user is deleted', async () => {
    const user = await fx.createUser();
    userId = user.id;
    await syncCandidate(userId);

    await user.destroy();
    await syncCandidate(userId);

    const doc = await CandidateProfileView.findById(userId).lean();
    expect(doc).toBeNull();
    userId = null;
  });
});
