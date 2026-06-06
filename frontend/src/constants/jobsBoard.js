export const JOB_TYPES = [
  { value: 'full-time',  label: 'Full-time'  },
  { value: 'part-time',  label: 'Part-time'  },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance',  label: 'Freelance'  },
];

export const WORK_MODES = [
  { value: 'remote',  label: 'Remote'  },
  { value: 'on-site', label: 'On-site' },
  { value: 'hybrid',  label: 'Hybrid'  },
];

export const EXP_LEVELS = [
  { value: 'junior', label: 'Junior'    },
  { value: 'mid',    label: 'Mid-level' },
  { value: 'senior', label: 'Senior'    },
];

export const SORT_OPTIONS = [
  { value: 'relevance',       label: 'Relevance' },
  { value: 'newest',          label: 'Newest' },
  { value: 'salary_high',     label: 'Salary: High to Low' },
  { value: 'salary_low',      label: 'Salary: Low to High' },
  { value: 'most_applicants', label: 'Most Applicants' },
];

export const TYPE_BADGE = {
  'full-time':  'bg-blue-100 text-blue-800',
  'part-time':  'bg-green-100 text-green-800',
  'internship': 'bg-purple-100 text-purple-800',
  'freelance':  'bg-indigo-100 text-indigo-800',
};

export const EXP_BADGE = {
  junior: 'bg-orange-100 text-orange-700',
  mid:    'bg-yellow-100 text-yellow-700',
  senior: 'bg-orange-100 text-orange-700',
};

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 'bg-teal-600',
  'bg-emerald-600', 'bg-sky-600', 'bg-rose-600', 'bg-amber-600',
];

export function timeAgo(date) {
  if (!date) return '';
  const days = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1d ago';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1mo ago' : `${months}mo ago`;
}

export function initials(name = '') {
  const words = name.trim().split(/\s+/);
  return words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase() || '?';
}

export function avatarColor(name = '') {
  const index = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function fmtSalary(job) {
  if (!job.budgetMin && !job.budgetMax) return null;
  const isFreelance = job.workMode === 'freelance';
  const lo = job.budgetMin ? `$${Number(job.budgetMin).toLocaleString()}` : null;
  const hi = job.budgetMax ? `$${Number(job.budgetMax).toLocaleString()}` : null;
  const range = lo && hi ? `${lo}–${hi}` : lo ?? hi;
  return isFreelance ? range : `${range}/yr`;
}

export function fmtSchedule(schedule) {
  if (!schedule?.days?.length && !schedule?.startTime) return null;
  const days = schedule.days?.join(', ') ?? '';
  const hours = (schedule.startTime && schedule.endTime)
    ? `${schedule.startTime}–${schedule.endTime}`
    : '';
  return [days, hours].filter(Boolean).join(' · ');
}
