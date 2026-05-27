const MS_DAY = 86400000;

export const DATE_RANGES = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: 'all', label: 'All time', days: null },
];

export function getRangeWindows(rangeKey) {
  const range = DATE_RANGES.find((r) => r.value === rangeKey) ?? DATE_RANGES[1];
  const now = Date.now();

  if (!range.days) {
    return { currentStart: null, currentEnd: now, previousStart: null, previousEnd: null };
  }

  const currentStart = now - range.days * MS_DAY;
  const previousStart = now - range.days * 2 * MS_DAY;
  const previousEnd = currentStart;

  return { currentStart, currentEnd: now, previousStart, previousEnd };
}

export function isInWindow(dateStr, start, end) {
  if (!dateStr) return false;
  const time = new Date(dateStr).getTime();
  if (Number.isNaN(time)) return false;
  if (start != null && time < start) return false;
  if (end != null && time > end) return false;
  return true;
}

export function calcTrend(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function normalizeApplication(app, job) {
  const candidate = app.candidate ?? app.Candidate ?? app.user ?? app.User ?? {};
  const jobData = app.job ?? app.Job ?? job ?? {};

  return {
    id: app.id,
    jobId: app.jobId ?? jobData.id ?? job?.id,
    jobTitle: jobData.title ?? job?.title ?? 'Untitled role',
    status: (app.status ?? 'pending').toLowerCase(),
    appliedAt: app.appliedAt ?? app.applied_at ?? app.createdAt ?? app.created_at,
    candidateFirstName: candidate.firstName ?? candidate.first_name ?? '',
    candidateLastName: candidate.lastName ?? candidate.last_name ?? '',
    candidateEmail: candidate.email ?? '',
    candidateHeadline: candidate.headline ?? '',
    candidateBio: candidate.bio ?? '',
    candidateAvatar: candidate.avatarPath ?? candidate.avatar_path ?? null,
    candidateLocation: candidate.location ?? '',
    coverLetter: app.coverLetter ?? app.cover_letter ?? '',
    resumePath: app.resumePath ?? app.resume_path ?? candidate.resumePath ?? null,
  };
}

export function extractJobs(response) {
  if (Array.isArray(response)) return response;
  return response?.data ?? response?.jobs ?? [];
}

export function extractApplications(response) {
  if (Array.isArray(response)) return response;
  return response?.applications ?? response?.data ?? [];
}
