import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { formatSalary, companyInitials } from '../utils/format';
import JobMeta from './JobMeta';

export function JobCardSkeleton({ variant = 'full', layout = 'grid' }) {
  const list = layout === 'list';
  return (
    <div className={`surface animate-pulse ${list ? 'p-5' : variant === 'compact' ? 'p-4' : 'p-5'}`}>
      <div className={`flex ${list ? 'gap-5 items-center' : 'gap-3'}`}>
        <div className={`${list ? 'w-14 h-14' : 'w-12 h-12'} rounded-lg bg-gray-100 shrink-0`} />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 bg-gray-100 rounded-md w-2/3" />
          <div className="h-3 bg-gray-100 rounded-md w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function JobCard({
  job,
  onClick,
  to,
  variant = 'full',
  layout = 'grid',
  showApply = false,
  matchScore = null,
}) {
  const companyName = job.company?.name ?? 'Company';
  const compact = variant === 'compact';
  const list = layout === 'list';

  const className = list
    ? 'surface-hover group block p-5 border-l-[3px] border-l-transparent hover:border-l-blue-600'
    : compact
      ? 'surface-hover group block p-4'
      : 'surface-hover group block p-5';

  const logoSize = list ? 'w-14 h-14 text-base' : compact ? 'w-10 h-10 text-xs' : 'w-12 h-12 text-sm';

  const inner = list ? (
    <div className="flex gap-5 items-start sm:items-center">
      <div
        className={`${logoSize} rounded-lg bg-gray-50 flex items-center justify-center font-semibold text-gray-600 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors duration-150`}
      >
        {companyInitials(companyName)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-150">
            {job.title}
          </h3>
          {matchScore != null && matchScore > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
              {matchScore}% match
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-0.5">{companyName}</p>
        <JobMeta job={job} className="mt-2" />
        {job.description && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-1 hidden sm:block">
            {job.description}
          </p>
        )}
      </div>

      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 pl-4">
        <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
          {formatSalary(job.budgetMin, job.budgetMax)}
        </p>
        <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-150" />
      </div>
    </div>
  ) : (
    <div className="flex gap-3">
      <div
        className={`${logoSize} rounded-lg bg-gray-50 flex items-center justify-center font-semibold text-gray-600 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors duration-150`}
      >
        {companyInitials(companyName)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-150 truncate ${
            compact ? 'text-sm' : 'text-base'
          }`}>
            {job.title}
          </h3>
          {matchScore != null && matchScore > 0 && (
            <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
              {matchScore}% match
            </span>
          )}
        </div>
        <p className={`text-gray-600 ${compact ? 'text-xs mt-0.5' : 'text-sm mt-0.5'}`}>{companyName}</p>
        <JobMeta job={job} className={compact ? 'mt-1.5' : 'mt-2'} />

        {!compact && (
          <>
            <p className="text-sm font-semibold text-gray-900 mt-2.5">
              {formatSalary(job.budgetMin, job.budgetMax)}
            </p>
            {job.description && (
              <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                {job.description}
              </p>
            )}
          </>
        )}

        {compact && (
          <p className="text-xs font-semibold text-gray-800 mt-2">
            {formatSalary(job.budgetMin, job.budgetMax)}
          </p>
        )}

        {showApply && to && (
          <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-blue-600 group-hover:text-blue-700">
            View role
            <ChevronRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className={className}>{inner}</Link>;
  }

  return (
    <article onClick={onClick} className={className}>
      {inner}
    </article>
  );
}
