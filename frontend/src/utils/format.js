export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week ago';
  if (weeks < 5) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  return `${months} months ago`;
}

export function formatSalary(min, max) {
  const fmt = (n) => `$${Math.round(n / 1000).toLocaleString()}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  if (max) return `Up to ${fmt(max)}`;
  return 'Competitive salary';
}

export function formatLabel(value) {
  if (!value) return '';
  return value
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Remote / hybrid / on-site — NOT a city. */
export function formatWorkMode(workMode) {
  if (!workMode) return null;
  const map = {
    remote: 'Remote',
    hybrid: 'Hybrid',
    'on-site': 'On-site',
    onsite: 'On-site',
  };
  return map[workMode.toLowerCase()] ?? formatLabel(workMode);
}

export function formatEmploymentType(type) {
  if (!type) return null;
  return formatLabel(type);
}

/** One-line summary for cards: "Full-time · Remote · Posted 2d ago" */
export function formatJobSummary(job) {
  const parts = [
    formatEmploymentType(job?.employmentType),
    formatWorkMode(job?.workMode),
    job?.createdAt ? formatRelativeTime(job.createdAt) : null,
  ].filter(Boolean);
  return parts.join(' · ');
}

export function companyInitials(name) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
