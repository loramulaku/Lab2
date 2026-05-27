import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Button from './Button';

function EmptyIllustration() {
  return (
    <svg className="w-28 h-28 mx-auto text-gray-200" viewBox="0 0 128 128" fill="none" aria-hidden>
      <rect x="24" y="40" width="80" height="56" rx="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M24 52h80" stroke="currentColor" strokeWidth="1.5" />
      <rect x="36" y="64" width="40" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="36" y="72" width="56" height="3" rx="1.5" fill="currentColor" opacity="0.35" />
      <circle cx="96" cy="96" r="18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M107 107l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function JobBrowseEmpty({ hasFilters, onClearFilters }) {
  return (
    <div className="surface py-16 px-8 text-center animate-slide-up">
      <EmptyIllustration />
      <h3 className="mt-5 text-lg font-semibold text-gray-900">
        {hasFilters ? 'No jobs match your search' : 'No open positions right now'}
      </h3>
      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
        {hasFilters
          ? 'Broaden your keywords, try a different city, or adjust work arrangement and salary.'
          : 'New roles are posted regularly. Create a profile to get notified when matches appear.'}
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        {hasFilters && (
          <Button variant="secondary" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
        <Link to="/register" className="btn-primary">
          Create a profile
        </Link>
      </div>
    </div>
  );
}

export function JobSearchBar({
  value,
  onChange,
  placeholder = 'Job title, keywords, or company',
  large = false,
}) {
  return (
    <div className="relative flex-1">
      <MagnifyingGlassIcon className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${
        large ? 'w-5 h-5' : 'w-4 h-4'
      }`} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`input-field ${large ? 'pl-11 py-3 text-base' : 'pl-10'}`}
      />
    </div>
  );
}

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'date', label: 'Newest first' },
  { value: 'salary', label: 'Highest salary' },
];

export function JobSortSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-field py-2.5 pr-8 cursor-pointer min-w-[10rem]"
      aria-label="Sort jobs"
    >
      {SORT_OPTIONS.map(({ value: v, label }) => (
        <option key={v} value={v}>{label}</option>
      ))}
    </select>
  );
}
