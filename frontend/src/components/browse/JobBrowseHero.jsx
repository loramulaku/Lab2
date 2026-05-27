import { Link, useLocation } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/outline';
import JobSearchHero from '../JobSearchHero';
import { JOB_TYPE_LINKS } from '../../constants/navigation';
import { JOB_TYPE_OPTIONS, WORK_MODE_OPTIONS } from '../JobFilters.constants';

export default function JobBrowseHero({
  search,
  location,
  onSearchChange,
  onLocationChange,
  selectedWorkModes,
  onWorkModesChange,
  selectedTypes,
  onTypesChange,
  defaultType,
  resultCount,
  loading,
}) {
  const { pathname } = useLocation();

  const toggleWorkMode = (value) => {
    onWorkModesChange(
      selectedWorkModes.includes(value)
        ? selectedWorkModes.filter((m) => m !== value)
        : [...selectedWorkModes, value]
    );
  };

  const toggleType = (value) => {
    onTypesChange(
      selectedTypes.includes(value)
        ? selectedTypes.filter((t) => t !== value)
        : [...selectedTypes, value]
    );
  };

  const typeLabel = defaultType
    ? JOB_TYPE_OPTIONS.find((t) => t.value === defaultType)?.label
    : null;

  return (
    <section className="browse-hero relative overflow-hidden">
      <div className="absolute inset-0 browse-hero-grid opacity-[0.35]" aria-hidden />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl" aria-hidden />

      <div className="page-container relative py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-blue-300/90 text-xs font-medium uppercase tracking-wider mb-2">
              <SparklesIcon className="w-3.5 h-3.5" />
              Job discovery
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {typeLabel ? `${typeLabel} roles` : 'Find your next role'}
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-xl">
              {typeLabel
                ? `Browse open ${typeLabel.toLowerCase()} positions — preview roles instantly without losing your place.`
                : 'Search, filter, and preview openings side by side. Click a role to see details before you apply.'}
            </p>
          </div>

          {!loading && (
            <div className="browse-hero-stat shrink-0">
              <p className="text-2xl font-bold text-white tabular-nums">
                {resultCount.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {resultCount === 1 ? 'open role' : 'open roles'}
              </p>
            </div>
          )}
        </div>

        <JobSearchHero
          search={search}
          location={location}
          onSearchChange={onSearchChange}
          onLocationChange={onLocationChange}
          variant="browse"
          className="browse-search-shell"
        />

        {/* Category segments — replaces separate tab bar on browse */}
        <div className="mt-4 flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {JOB_TYPE_LINKS.map(({ label, href }) => {
            const active =
              href === '/jobs' ? pathname === '/jobs' : pathname === href;

            return (
              <Link
                key={href}
                to={href}
                className={active ? 'browse-segment-active' : 'browse-segment'}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Work arrangement — primary filter, visible in hero */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 mr-1">Work style</span>
          {WORK_MODE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleWorkMode(value)}
              className={
                selectedWorkModes.includes(value)
                  ? 'browse-chip-active'
                  : 'browse-chip'
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Employment type — only on main browse (tabs handle typed routes) */}
        {!defaultType && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 mr-1">Type</span>
            {JOB_TYPE_OPTIONS.filter((t) => t.value !== 'contract').map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleType(value)}
                className={
                  selectedTypes.includes(value)
                    ? 'browse-chip-active'
                    : 'browse-chip'
                }
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
