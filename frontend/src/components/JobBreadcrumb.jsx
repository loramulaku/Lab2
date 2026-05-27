import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { formatEmploymentType } from '../utils/format';

const TYPE_ROUTES = {
  'full-time': '/jobs/full-time',
  'part-time': '/jobs/part-time',
  freelance: '/jobs/freelance',
  contract: '/jobs',
};

export default function JobBreadcrumb({ jobTitle, employmentType }) {
  const typeLabel = formatEmploymentType(employmentType);
  const typeHref = TYPE_ROUTES[employmentType] ?? '/jobs';

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500 mb-6">
      <Link to="/jobs" className="hover:text-gray-900 transition-colors">
        Find jobs
      </Link>
      {typeLabel && (
        <>
          <ChevronRightIcon className="w-3.5 h-3.5 shrink-0" aria-hidden />
          <Link to={typeHref} className="hover:text-gray-900 transition-colors">
            {typeLabel}
          </Link>
        </>
      )}
      {jobTitle && (
        <>
          <ChevronRightIcon className="w-3.5 h-3.5 shrink-0" aria-hidden />
          <span className="text-gray-900 font-medium truncate max-w-[14rem] sm:max-w-xs">
            {jobTitle}
          </span>
        </>
      )}
    </nav>
  );
}
