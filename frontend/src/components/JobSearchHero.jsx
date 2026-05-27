import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import LocationAutocomplete from './LocationAutocomplete';

/**
 * Shared job search — same pattern on homepage (submit → /jobs) and browse (live filter).
 */
export default function JobSearchHero({
  search,
  location,
  onSearchChange,
  onLocationChange,
  onSubmit,
  variant = 'page',
  className = '',
}) {
  const isHome = variant === 'home';
  const isBrowse = variant === 'browse';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.();
  };

  const shellClass = isHome
    ? 'p-2 surface shadow-md shadow-gray-200/50'
    : isBrowse
      ? 'browse-search-inner'
      : 'lg:p-1.5 lg:surface lg:shadow-sm';

  const inputClass = isBrowse
    ? 'browse-search-input'
    : `input-field border-0 shadow-none focus:ring-0 lg:focus:ring-2 ${
        isHome ? 'pl-11 py-3.5 text-base rounded-lg lg:rounded-l-lg lg:rounded-r-none' : 'pl-10 py-3 text-base lg:rounded-l-lg lg:rounded-r-none'
      }`;

  const locationClass = isBrowse
    ? 'browse-search-input rounded-lg lg:rounded-none lg:rounded-r-lg'
    : isHome
      ? 'rounded-lg lg:rounded-none border-0 shadow-none focus:ring-0 lg:focus:ring-2'
      : 'lg:rounded-r-lg border-0 shadow-none focus:ring-0 lg:focus:ring-2';

  return (
    <form
      onSubmit={handleSubmit}
      className={`${shellClass} ${className}`}
    >
      <div className={`grid grid-cols-1 ${isHome ? 'lg:grid-cols-[1fr_1fr_auto]' : 'lg:grid-cols-2'} gap-2 lg:gap-0`}>
        <div className={`relative ${!isHome && !isBrowse ? 'lg:border-r lg:border-gray-100' : isBrowse ? 'lg:border-r lg:border-white/10' : ''}`}>
          <label htmlFor="job-search-q" className="sr-only">Job title or company</label>
          <MagnifyingGlassIcon
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              isBrowse ? 'w-5 h-5 text-slate-400' : 'text-gray-400'
            } ${isHome ? 'w-5 h-5' : !isBrowse ? 'w-4 h-4' : ''}`}
          />
          <input
            id="job-search-q"
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Job title or company"
            className={isBrowse ? `${inputClass} pl-11 py-3.5 text-base rounded-lg lg:rounded-l-lg lg:rounded-r-none` : inputClass}
          />
        </div>

        <div className="relative">
          <label htmlFor="job-search-where" className="sr-only">City or region</label>
          <LocationAutocomplete
            id="job-search-where"
            value={location}
            onChange={onLocationChange}
            placeholder="City or region (optional)"
            large={isHome || isBrowse}
            className={locationClass}
          />
        </div>

        {isHome && (
          <button
            type="submit"
            className="btn-primary px-8 py-3.5 text-base rounded-lg lg:rounded-r-lg lg:rounded-l-none shrink-0"
          >
            Search jobs
          </button>
        )}
      </div>
    </form>
  );
}
