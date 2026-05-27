import { formatSalary, companyInitials } from '../../utils/format';
import JobMeta from '../JobMeta';

const MODE_STYLES = {
  remote: {
    accent: 'border-l-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20',
    selected: 'ring-emerald-500/40',
  },
  hybrid: {
    accent: 'border-l-amber-400',
    badge: 'bg-amber-500/10 text-amber-800 ring-amber-500/20',
    selected: 'ring-amber-500/40',
  },
  'on-site': {
    accent: 'border-l-blue-400',
    badge: 'bg-blue-500/10 text-blue-700 ring-blue-500/20',
    selected: 'ring-blue-500/40',
  },
};

function getModeStyle(workMode) {
  const key = (workMode ?? '').toLowerCase();
  return MODE_STYLES[key] ?? MODE_STYLES['on-site'];
}

export default function JobListItem({ job, selected, onSelect, searchQuery = '' }) {
  const companyName = job.company?.name ?? 'Company';
  const mode = getModeStyle(job.workMode);
  const skills = (job.skills ?? []).slice(0, 3);

  const highlight = (text) => {
    if (!searchQuery.trim() || !text) return text;
    const q = searchQuery.trim();
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-100 text-gray-900 rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(job)}
      className={`group w-full text-left border-l-[3px] ${mode.accent} rounded-xl border border-gray-200/80 bg-white p-4 transition-all duration-200 hover:shadow-md hover:border-gray-300 ${
        selected
          ? `shadow-md ring-2 ${mode.selected} border-gray-300`
          : 'shadow-sm'
      }`}
    >
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0 group-hover:from-blue-50 group-hover:to-blue-100 group-hover:text-blue-700 transition-colors">
          {companyInitials(companyName)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
              {highlight(job.title)}
            </h3>
            <span className="text-sm font-bold text-gray-900 tabular-nums shrink-0">
              {formatSalary(job.budgetMin, job.budgetMax)}
            </span>
          </div>

          <p className="text-sm text-gray-600 mt-0.5 truncate">{highlight(companyName)}</p>
          <JobMeta job={job} showPosted className="mt-1.5" />

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export function JobListItemSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse border-l-[3px] border-l-gray-200">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}
