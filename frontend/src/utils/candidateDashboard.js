const VIEWED_KEY = 'hireflow_viewed_jobs';
const SAVED_KEY = 'hireflow_saved_jobs';

export function getViewedJobs() {
  try {
    const raw = localStorage.getItem(VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addViewedJob(job) {
  if (!job?.id) return;
  const viewed = getViewedJobs().filter((j) => j.id !== job.id);
  viewed.unshift({
    id: job.id,
    title: job.title,
    company: job.company?.name ?? 'Company',
    workMode: job.workMode,
    viewedAt: new Date().toISOString(),
  });
  localStorage.setItem(VIEWED_KEY, JSON.stringify(viewed.slice(0, 12)));
}

export function getSavedJobCount() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw).length : 0;
  } catch {
    return 0;
  }
}

export function calcProfileCompletion(profile) {
  const segments = {
    profile: 0,
    skills: 0,
    experience: 0,
    education: 0,
  };

  const fields = [profile?.firstName, profile?.lastName, profile?.headline, profile?.bio, profile?.location];
  const filled = fields.filter(Boolean).length;
  segments.profile = Math.round((filled / fields.length) * 100);

  segments.skills = (profile?.skills?.length ?? 0) > 0 ? 100 : 0;
  segments.experience = (profile?.experiences?.length ?? 0) > 0 ? 100 : 0;
  segments.education = (profile?.educations?.length ?? 0) > 0 ? 100 : 0;

  const total = Math.round(
    (segments.profile + segments.skills + segments.experience + segments.education) / 4
  );

  return { segments, total };
}

export function matchJobScore(job, skillNames = []) {
  if (!skillNames.length || !job?.skills?.length) return null;
  const normalized = skillNames.map((s) => s.toLowerCase());
  const matches = job.skills.filter((s) => normalized.includes(s.toLowerCase())).length;
  return Math.min(99, Math.round((matches / job.skills.length) * 100) + 20);
}

export function recommendJobs(jobs, skillNames = [], limit = 3) {
  return jobs
    .map((job) => ({ job, score: matchJobScore(job, skillNames) ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ job, score }) => ({ ...job, matchScore: score }));
}
