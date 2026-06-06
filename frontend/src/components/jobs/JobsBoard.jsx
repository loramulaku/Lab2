import { Link } from 'react-router-dom';
import { PageCard } from '../layout';
import LocationAutocomplete from '../LocationAutocomplete';
import {
  EXP_BADGE, EXP_LEVELS, JOB_TYPES, TYPE_BADGE, WORK_MODES,
  avatarColor, fmtSalary, fmtSchedule, initials, timeAgo,
} from '../../constants/jobsBoard';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? '';

function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label onClick={onChange} className="flex items-center gap-2.5 cursor-pointer group py-0.5 select-none">
      <span className={`w-4 h-4 flex-shrink-0 border-2 flex items-center justify-center transition ${checked ? 'bg-gray-900 border-gray-900' : 'border-gray-400 group-hover:border-gray-600'}`}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5 8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <span className={`text-sm ${checked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{label}</span>
    </label>
  );
}

function CompanyAvatar({ company }) {
  const logoSrc = company?.logoPath ? `${API_BASE}${company.logoPath}` : null;
  if (logoSrc) {
    return <img src={logoSrc} alt={company.name} className="w-12 h-12 flex-shrink-0 object-contain border border-gray-100 bg-white rounded-lg" />;
  }
  return (
    <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold rounded-lg ${avatarColor(company?.name)}`}>
      {initials(company?.name)}
    </div>
  );
}

export function JobsSearchHero({ total, loading, qInput, locationInput, onQChange, onLocationChange, onClearQ, onClearLocation, onSearch }) {
  return (
    <div className="page-shell-hero-band pt-20 pb-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-950 mb-1">Find Your Next Opportunity</h1>
        <p className="text-blue-800/70 text-sm mb-6">
          {loading ? 'Searching…' : `${total} job${total !== 1 ? 's' : ''} available`}
        </p>
        <div className="page-shell-field flex flex-col sm:flex-row rounded-xl overflow-hidden transition-shadow">
          <div className="flex-1 flex items-center px-4 gap-2">
            <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              value={qInput}
              onChange={(e) => onQChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder="Job title, skill, or company…"
              className="flex-1 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
            />
            {qInput && <button type="button" onClick={onClearQ} className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0">×</button>}
          </div>
          <div className="w-full sm:w-56 flex items-center border-t sm:border-t-0 sm:border-l border-blue-200/50 px-3 gap-2">
            <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <LocationAutocomplete
              value={locationInput}
              onChange={onLocationChange}
              placeholder="Location"
              inputClassName="flex-1 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent border-0 w-full"
            />
            {locationInput && <button type="button" onClick={onClearLocation} className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0">×</button>}
          </div>
          <button onClick={onSearch} className="page-shell-btn px-6 py-3 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all whitespace-nowrap">
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

export function JobsFilterSidebar({ hasFilter, jobType, workMode, expLevel, minSalary, maxSalary, onToggle, onClearAll, onMinSalaryChange, onMaxSalaryChange }) {
  return (
    <PageCard className="w-52 flex-shrink-0 p-5 sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 text-sm">Filters</h2>
        {hasFilter && <button onClick={onClearAll} className="text-xs text-blue-600 hover:text-blue-800">Clear all</button>}
      </div>
      <div className="mb-5">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Job Type</p>
        <div className="space-y-1">
          {JOB_TYPES.map((t) => (
            <FilterCheckbox key={t.value} label={t.label} checked={jobType === t.value} onChange={() => onToggle('jobType', t.value)} />
          ))}
        </div>
      </div>
      {jobType !== 'freelance' && (
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Work Mode</p>
          <div className="space-y-1">
            {WORK_MODES.map((m) => (
              <FilterCheckbox key={m.value} label={m.label} checked={workMode === m.value} onChange={() => onToggle('workMode', m.value)} />
            ))}
          </div>
        </div>
      )}
      <div className="mb-5">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Experience Level</p>
        <div className="space-y-1">
          {EXP_LEVELS.map((e) => (
            <FilterCheckbox key={e.value} label={e.label} checked={expLevel === e.value} onChange={() => onToggle('expLevel', e.value)} />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Salary Range ($)</p>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500 mb-0.5 block">Min</label>
            <input type="number" min="0" step="1000" value={minSalary} onChange={(e) => onMinSalaryChange(e.target.value)} placeholder="e.g. 30000" className="page-shell-field w-full bg-white/70 px-2 py-1 text-xs rounded-md focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-0.5 block">Max</label>
            <input type="number" min="0" step="1000" value={maxSalary} onChange={(e) => onMaxSalaryChange(e.target.value)} placeholder="e.g. 120000" className="page-shell-field w-full bg-white/70 px-2 py-1 text-xs rounded-md focus:outline-none" />
          </div>
        </div>
      </div>
    </PageCard>
  );
}

export function JobsCategorySidebar({ categories, activeCategory, onSelect }) {
  if (!categories.length) return null;
  return (
    <PageCard className="w-44 flex-shrink-0 sticky top-20 overflow-hidden p-0">
      <div className="px-4 pt-4 pb-2 border-b border-blue-100/60">
        <h2 className="font-semibold text-gray-900 text-sm">Categories</h2>
      </div>
      <div className="py-1">
        <button onClick={() => onSelect('')} className={`w-full text-left px-4 py-2 text-sm transition ${!activeCategory ? 'bg-blue-600 text-white font-medium' : 'text-gray-700 hover:bg-white/60'}`}>All</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => onSelect(activeCategory === c.name ? '' : c.name)} className={`w-full text-left px-4 py-2 text-sm transition ${activeCategory === c.name ? 'bg-blue-600 text-white font-medium' : 'text-gray-700 hover:bg-white/60'}`}>
            {c.name}
          </button>
        ))}
      </div>
    </PageCard>
  );
}

function BookmarkIcon({ filled }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
    </svg>
  );
}

const APP_STATUS_LABEL = {
  pending:     'In review',
  in_review:   'In review',
  shortlisted: 'Shortlisted',
  interview:   'Interview',
  offer:       'Offer sent',
  accepted:    'Accepted',
  rejected:    'Rejected',
};

export function JobListingCard({ job, user, isCandidate, feedback, appliedStatus, hasBid, onApply, onBid, isSaved, onToggleSave }) {
  const freelance = job.workMode === 'freelance';
  const canBid = !!job.acceptsBids;
  const salary = fmtSalary(job);
  const sched = !freelance && fmtSchedule(job.schedule);
  const skills = job.skills ?? [];
  const shown = skills.slice(0, 4);
  const extra = skills.length - shown.length;

  return (
    <PageCard className="p-5 transition-shadow duration-200 hover:shadow-md">
      <div className="flex gap-4">
        <CompanyAvatar company={job.company} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-base leading-tight">{job.title}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{job.company?.name ?? '—'}</p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2">
                {user && isCandidate && onToggleSave && (
                  <button onClick={() => onToggleSave(job.id)} title={isSaved ? 'Remove bookmark' : 'Save job'}
                    className={`transition ${isSaved ? 'text-blue-600' : 'text-gray-300 hover:text-gray-500'}`}>
                    <BookmarkIcon filled={isSaved} />
                  </button>
                )}
                <Link to={`/job/${job.id}`} className="text-xs text-blue-600 hover:underline whitespace-nowrap">View details →</Link>
              </div>
              {feedback ? (
                <span className={`text-sm font-medium ${feedback.ok ? 'text-green-600' : 'text-red-600'}`}>{feedback.msg}</span>
              ) : !user ? (
                <Link to="/login" className="page-shell-btn px-4 py-1.5 text-gray-700 text-xs hover:bg-white/70 whitespace-nowrap rounded-md bg-white/80">Sign in</Link>
              ) : isCandidate ? (
                freelance
                  ? canBid && (hasBid
                      ? <span className="text-xs text-gray-400 italic">Bid submitted</span>
                      : <button onClick={() => onBid(job)} className="page-shell-btn px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 whitespace-nowrap rounded-md transition-all">Submit Bid</button>)
                  : appliedStatus
                      ? <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 whitespace-nowrap">{APP_STATUS_LABEL[appliedStatus] ?? 'Applied'}</span>
                      : <button onClick={() => onApply(job)} className="page-shell-btn px-4 py-1.5 bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 whitespace-nowrap rounded-md transition-all">Apply</button>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {job.company?.location && (
              <span className="text-xs text-gray-500 flex items-center gap-0.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {job.company.location.split(',').slice(0, 2).join(',')}
              </span>
            )}
            {!freelance && job.workMode && <span className="text-xs text-gray-400">({job.workMode})</span>}
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${TYPE_BADGE[job.employmentType] ?? TYPE_BADGE['full-time']}`}>
              {freelance ? 'Freelance' : job.employmentType?.replace(/-/g, '‑')}
            </span>
            {job.experienceLevel && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${EXP_BADGE[job.experienceLevel] ?? ''}`}>
                {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}
              </span>
            )}
            {sched && <span className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">{sched}</span>}
          </div>
          {shown.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {shown.map((s) => <span key={s} className="text-xs bg-white/70 text-gray-600 px-2 py-0.5 rounded">{s}</span>)}
              {extra > 0 && <span className="text-xs text-gray-400 px-1">+{extra}</span>}
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <div>{salary && <span className="text-sm font-semibold text-blue-700">{salary}</span>}</div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{freelance ? `${job.bidCount ?? 0} bid${(job.bidCount ?? 0) !== 1 ? 's' : ''}` : `${job.applicationCount ?? 0} applicant${(job.applicationCount ?? 0) !== 1 ? 's' : ''}`}</span>
              {job.createdAt && <span>{timeAgo(job.createdAt)}</span>}
            </div>
          </div>
        </div>
      </div>
    </PageCard>
  );
}
