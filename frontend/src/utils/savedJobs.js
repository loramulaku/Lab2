const STORAGE_KEY = 'hireflow_saved_jobs';

export function getSavedJobIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isJobSaved(jobId) {
  return getSavedJobIds().includes(Number(jobId));
}

export function toggleSavedJob(jobId) {
  const id = Number(jobId);
  const saved = getSavedJobIds();
  const next = saved.includes(id)
    ? saved.filter((item) => item !== id)
    : [...saved, id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next.includes(id);
}
