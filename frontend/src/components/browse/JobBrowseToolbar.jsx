import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { JobSortSelect } from '../JobBrowseToolbar';
import { SALARY_MIN, SALARY_MAX } from '../JobFilters.constants';

export const SALARY_QUICK_FILTERS = [
  { id: 'any', label: 'Any salary', range: [SALARY_MIN, SALARY_MAX] },
  { id: '50', label: '$50k+', range: [50000, SALARY_MAX] },
  { id: '100', label: '$100k+', range: [100000, SALARY_MAX] },
  { id: '150', label: '$150k+', range: [150000, SALARY_MAX] },
];

export default function JobBrowseToolbar({
  salaryRange,
  onSalaryChange,
  sort,
  onSortChange,
  onOpenFilters,
  onClearFilters,
  hasActiveFilters,
  mobileFiltersOpen,
}) {
  const activeSalaryId =
    SALARY_QUICK_FILTERS.find(
      (f) => f.range[0] === salaryRange[0] && f.range[1] === salaryRange[1]
    )?.id ?? 'custom';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 border-b border-gray-200/80">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-1">
        <span className="text-xs font-medium text-gray-500 shrink-0">Pay</span>
        {SALARY_QUICK_FILTERS.map(({ id, label, range }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSalaryChange(range)}
            className={
              activeSalaryId === id ? 'browse-chip-active-light' : 'browse-chip-light'
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="btn-ghost text-xs py-1.5 px-2 text-gray-500"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={onOpenFilters}
          className="lg:hidden btn-secondary py-2 text-xs"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          {mobileFiltersOpen ? 'Hide' : 'More filters'}
        </button>
        <JobSortSelect value={sort} onChange={onSortChange} />
      </div>
    </div>
  );
}
