import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import {
  JOB_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
  SALARY_MIN,
  SALARY_MAX,
  SALARY_STEP,
} from './JobFilters.constants';

export {
  JOB_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
  SALARY_MIN,
  SALARY_MAX,
  SALARY_STEP,
} from './JobFilters.constants';

export default function JobFilters({
  selectedTypes,
  onTypesChange,
  selectedWorkModes,
  onWorkModesChange,
  salaryRange,
  onSalaryChange,
  onClear,
  hideTypeFilter = false,
  className = '',
}) {
  const toggleType = (value) => {
    onTypesChange(
      selectedTypes.includes(value)
        ? selectedTypes.filter((t) => t !== value)
        : [...selectedTypes, value]
    );
  };

  const toggleWorkMode = (value) => {
    onWorkModesChange(
      selectedWorkModes.includes(value)
        ? selectedWorkModes.filter((m) => m !== value)
        : [...selectedWorkModes, value]
    );
  };

  const hasActiveFilters =
    selectedTypes.length > 0 ||
    selectedWorkModes.length > 0 ||
    salaryRange[0] > SALARY_MIN ||
    salaryRange[1] < SALARY_MAX;

  return (
    <aside className={`lg:sticky lg:top-[7.25rem] w-full lg:w-64 shrink-0 ${className}`}>
      <div className="surface p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Refine results</h2>
          </div>
          {hasActiveFilters && (
            <button type="button" onClick={onClear} className="text-xs font-medium text-blue-600 hover:text-blue-700">
              Reset
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="section-label mb-1">Work arrangement</p>
            <p className="text-xs text-gray-500 mb-3">Remote, hybrid, or in-office — not the same as city.</p>
            <div className="flex flex-wrap gap-2">
              {WORK_MODE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleWorkMode(value)}
                  className={
                    selectedWorkModes.includes(value)
                      ? 'filter-pill-active'
                      : 'filter-pill-inactive'
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {!hideTypeFilter && (
            <div>
              <p className="section-label mb-3">Employment type</p>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPE_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleType(value)}
                    className={
                      selectedTypes.includes(value)
                        ? 'filter-pill-active'
                        : 'filter-pill-inactive'
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="section-label">Salary range</p>
              <span className="text-xs font-medium text-gray-700 tabular-nums">
                ${(salaryRange[0] / 1000).toFixed(0)}k – ${(salaryRange[1] / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="space-y-4 pt-1">
              <input
                type="range"
                min={SALARY_MIN}
                max={SALARY_MAX}
                step={SALARY_STEP}
                value={salaryRange[0]}
                onChange={(e) => {
                  const min = Number(e.target.value);
                  onSalaryChange([min, Math.max(min, salaryRange[1])]);
                }}
                className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                aria-label="Minimum salary"
              />
              <input
                type="range"
                min={SALARY_MIN}
                max={SALARY_MAX}
                step={SALARY_STEP}
                value={salaryRange[1]}
                onChange={(e) => {
                  const max = Number(e.target.value);
                  onSalaryChange([Math.min(salaryRange[0], max), max]);
                }}
                className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                aria-label="Maximum salary"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
