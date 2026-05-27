import {
  formatEmploymentType,
  formatWorkMode,
  formatRelativeTime,
  formatSalary,
} from '../utils/format';

/**
 * Consistent job facts — same labels everywhere (browse, detail, dashboard).
 * workMode = Remote/Hybrid (not a city). Location search is separate.
 */
export default function JobMeta({
  job,
  showSalary = false,
  showPosted = true,
  size = 'sm',
  className = '',
}) {
  const employment = formatEmploymentType(job?.employmentType);
  const workMode = formatWorkMode(job?.workMode);
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${textSize} text-gray-500 ${className}`}>
      {employment && (
        <span className="font-medium text-gray-700">{employment}</span>
      )}
      {employment && workMode && <span aria-hidden>·</span>}
      {workMode && <span>{workMode}</span>}
      {showPosted && job?.createdAt && (
        <>
          {(employment || workMode) && <span aria-hidden>·</span>}
          <span>Posted {formatRelativeTime(job.createdAt)}</span>
        </>
      )}
      {showSalary && (job?.budgetMin || job?.budgetMax) && (
        <>
          <span aria-hidden>·</span>
          <span className="font-medium text-gray-800">
            {formatSalary(job.budgetMin, job.budgetMax)}
          </span>
        </>
      )}
    </div>
  );
}

export function JobMetaBadges({ job, className = '' }) {
  const employment = formatEmploymentType(job?.employmentType);
  const workMode = formatWorkMode(job?.workMode);

  if (!employment && !workMode) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {employment && (
        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
          {employment}
        </span>
      )}
      {workMode && (
        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
          {workMode}
        </span>
      )}
    </div>
  );
}
