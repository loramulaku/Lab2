import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { PageShell } from '../components/layout';
import BidModal from '../components/freelance/BidModal';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { useAuth } from '../context/AuthContext';
import freelanceService from '../services/freelanceService';
import candidateService from '../services/candidateService';

/**
 * Public job board.
 *
 * URL path params (/jobs/:filter) from header nav links are still supported;
 * they seed the filter state on mount but do NOT appear in the URL thereafter.
 *
 * Every filter, search, location, and sort hits the real API.
 * Freelance jobs are identified by work_mode = 'freelance' — the recruiter-side
 * Bid/Invite/Both (jobMode) distinction is never exposed to job seekers.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? '';

// ── Filter definitions ─────────────────────────────────────────────────────────
const JOB_TYPES = [
  { value: 'full-time',  label: 'Full-time'  },
  { value: 'part-time',  label: 'Part-time'  },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance',  label: 'Freelance'  },
];
const WORK_MODES = [
  { value: 'remote',  label: 'Remote'  },
  { value: 'on-site', label: 'On-site' },
  { value: 'hybrid',  label: 'Hybrid'  },
];
const EXP_LEVELS = [
  { value: 'junior', label: 'Junior'    },
  { value: 'mid',    label: 'Mid-level' },
  { value: 'senior', label: 'Senior'    },
];

const SORT_OPTIONS = [
  { value: 'relevance',       label: 'Relevance' },
  { value: 'newest',          label: 'Newest' },
  { value: 'salary_high',     label: 'Salary: High to Low' },
  { value: 'salary_low',      label: 'Salary: Low to High' },
  { value: 'most_applicants', label: 'Most Applicants' },
];

// ── Badge colours ──────────────────────────────────────────────────────────────
const TYPE_BADGE = {
  'full-time':  'bg-blue-100 text-blue-800',
  'part-time':  'bg-green-100 text-green-800',
  'internship': 'bg-purple-100 text-purple-800',
  'freelance':  'bg-indigo-100 text-indigo-800',
};
const EXP_BADGE = {
  junior: 'bg-orange-100 text-orange-700',
  mid:    'bg-yellow-100 text-yellow-700',
  senior: 'bg-orange-100 text-orange-700',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function timeAgo(d) {
  if (!d) return '';
  const days = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1d ago';
  if (days < 30)  return `${days}d ago`;
  const m = Math.floor(days / 30);
  return m === 1 ? '1mo ago' : `${m}mo ago`;
}

function initials(name = '') {
  const w = name.trim().split(/\s+/);
  return w.length >= 2 ? (w[0][0] + w[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase() || '?';
}

const COLORS = ['bg-blue-600','bg-indigo-600','bg-violet-600','bg-teal-600','bg-emerald-600','bg-sky-600','bg-rose-600','bg-amber-600'];
const avatarColor = (n = '') => COLORS[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];

function fmtSalary(job) {
  if (!job.budgetMin && !job.budgetMax) return null;
  const isFreelance = job.workMode === 'freelance';
  const lo = job.budgetMin ? `$${Number(job.budgetMin).toLocaleString()}` : null;
  const hi = job.budgetMax ? `$${Number(job.budgetMax).toLocaleString()}` : null;
  const range = lo && hi ? `${lo}–${hi}` : lo ?? hi;
  return isFreelance ? range : `${range}/yr`;
}

function fmtSchedule(schedule) {
  if (!schedule?.days?.length && !schedule?.startTime) return null;
  const days = schedule.days?.join(', ') ?? '';
  const hours = (schedule.startTime && schedule.endTime)
    ? `${schedule.startTime}–${schedule.endTime}`
    : '';
  return [days, hours].filter(Boolean).join(' · ');
}

// ── FilterCheckbox ─────────────────────────────────────────────────────────────
function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label onClick={onChange} className="flex items-center gap-2.5 cursor-pointer group py-0.5 select-none">
      <span className={`w-4 h-4 flex-shrink-0 border-2 flex items-center justify-center transition ${
        checked ? 'bg-gray-900 border-gray-900' : 'border-gray-400 group-hover:border-gray-600'
      }`}>
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

// ── Company avatar ─────────────────────────────────────────────────────────────
function CompanyAvatar({ company }) {
  const logoSrc = company?.logoPath ? `${API_BASE}${company.logoPath}` : null;
  if (logoSrc) {
    return (
      <img src={logoSrc} alt={company.name}
        className="w-12 h-12 flex-shrink-0 object-contain border border-gray-100 bg-white" />
    );
  }
  return (
    <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${avatarColor(company?.name)}`}>
      {initials(company?.name)}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Jobs() {
  const { filter: urlFilter } = useParams();
  const { user }    = useAuth();
  const isCandidate = (user?.roles ?? []).includes('candidate');

  // Search inputs (only committed on Search button click)
  const [qInput,        setQInput]        = useState('');
  const [locationInput, setLocationInput] = useState('');

  // Active filter values (each change triggers a fetch)
  const [activeQ,    setActiveQ]    = useState('');
  const [activeLoc,  setActiveLoc]  = useState('');
  const [jobType,    setJobType]    = useState('');
  const [workMode,   setWorkMode]   = useState('');
  const [expLevel,   setExpLevel]   = useState('');
  const [minSalary,  setMinSalary]  = useState('');
  const [maxSalary,  setMaxSalary]  = useState('');
  const [category,   setCategory]   = useState('');   // category name string
  const [sort,       setSort]       = useState('relevance');
  const [categories, setCategories] = useState([]);   // from API

  const [jobs,    setJobs]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [bidJob,  setBidJob]  = useState(null);
  const [feedback,setFeedback]= useState({});

  // Seed from URL path param on first mount only
  useEffect(() => {
    if (!urlFilter) return;
    if (urlFilter === 'freelance') setJobType('freelance');
    else if (['full-time','part-time','internship'].includes(urlFilter)) setJobType(urlFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { status: 'open', limit: 50, sort };

      if (jobType === 'freelance') params.workMode       = 'freelance';
      else if (jobType)            params.employmentType = jobType;

      if (workMode && jobType !== 'freelance') params.workMode = workMode;
      if (expLevel)   params.experienceLevel = expLevel;
      if (minSalary)  params.minSalary       = minSalary;
      if (maxSalary)  params.maxSalary       = maxSalary;
      if (category)   params.category        = category;
      if (activeQ)    params.q               = activeQ;
      if (activeLoc)  params.location        = activeLoc;

      const res = await freelanceService.listJobs(params);
      setJobs(res.data ?? []);
      setTotal(res.total ?? (res.data ?? []).length);
    } catch {
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [jobType, workMode, expLevel, minSalary, maxSalary, category, sort, activeQ, activeLoc]);

  useEffect(() => { load(); }, [load]);

  // Load categories once on mount
  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data ?? [])).catch(() => {});
  }, []);

  const handleSearch = () => {
    setActiveQ(qInput.trim());
    setActiveLoc(locationInput.trim());
  };

  const toggle = (cur, set, val) => set(cur === val ? '' : val);

  const clearAll = () => {
    setJobType(''); setWorkMode(''); setExpLevel(''); setMinSalary(''); setMaxSalary('');
    setCategory(''); setSort('relevance');
    setActiveQ(''); setActiveLoc(''); setQInput(''); setLocationInput('');
  };

  const apply = async (job) => {
    if (!user) return;
    try {
      await candidateService.applyToJob(job.id);
      setFeedback(f => ({ ...f, [job.id]: { ok: true, msg: 'Applied ✓' } }));
    } catch (err) {
      setFeedback(f => ({ ...f, [job.id]: { ok: false, msg: err?.response?.data?.message || 'Failed' } }));
    }
  };

  const submitBid = async (data) => {
    await freelanceService.submitBid(bidJob.id, data);
    setFeedback(f => ({ ...f, [bidJob.id]: { ok: true, msg: 'Bid submitted ✓' } }));
    setBidJob(null);
  };

  const hasFilter = jobType || workMode || expLevel || minSalary || maxSalary || category || activeQ || activeLoc;

  return (
    <PageShell flush>
      {/* ── Dark-navy search header ──────────────────────────────────────── */}
      <div className="bg-[#1e3a5f] pt-20 pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-1">Find Your Next Opportunity</h1>
          <p className="text-blue-200 text-sm mb-6">
            {loading ? 'Searching…' : `${total} job${total !== 1 ? 's' : ''} available`}
          </p>

          {/* Search bar */}
          <div className="flex">
            {/* Keyword input */}
            <div className="flex-1 flex items-center bg-white px-4 gap-2 border border-white">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input value={qInput} onChange={e => setQInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Job title, skill, or company…"
                className="flex-1 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none" />
              {qInput && (
                <button type="button" onClick={() => { setQInput(''); setActiveQ(''); }}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0">×</button>
              )}
            </div>

            {/* Location input */}
            <div className="w-56 flex items-center bg-white border-l border-gray-200 px-3 gap-2">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <LocationAutocomplete
                value={locationInput}
                onChange={setLocationInput}
                placeholder="Location"
                inputClassName="flex-1 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent border-0 w-full"
              />
              {locationInput && (
                <button type="button" onClick={() => { setLocationInput(''); setActiveLoc(''); }}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0">×</button>
              )}
            </div>

            <button onClick={handleSearch}
              className="px-6 bg-blue-500 text-white text-sm font-semibold hover:bg-blue-400 transition whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ── Three-column body ────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6 items-start">

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className="w-52 flex-shrink-0 bg-white border border-gray-200 p-5 sticky top-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm">Filters</h2>
            {hasFilter && (
              <button onClick={clearAll} className="text-xs text-blue-600 hover:text-blue-800">Clear all</button>
            )}
          </div>

          {/* Job Type */}
          <div className="mb-5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Job Type</p>
            <div className="space-y-1">
              {JOB_TYPES.map(t => (
                <FilterCheckbox key={t.value} label={t.label} checked={jobType === t.value}
                  onChange={() => toggle(jobType, setJobType, t.value)} />
              ))}
            </div>
          </div>

          {/* Work Mode — hidden when Freelance selected (workMode is already implied) */}
          {jobType !== 'freelance' && (
            <div className="mb-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Work Mode</p>
              <div className="space-y-1">
                {WORK_MODES.map(m => (
                  <FilterCheckbox key={m.value} label={m.label} checked={workMode === m.value}
                    onChange={() => toggle(workMode, setWorkMode, m.value)} />
                ))}
              </div>
            </div>
          )}

          {/* Experience Level */}
          <div className="mb-5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Experience Level</p>
            <div className="space-y-1">
              {EXP_LEVELS.map(e => (
                <FilterCheckbox key={e.value} label={e.label} checked={expLevel === e.value}
                  onChange={() => toggle(expLevel, setExpLevel, e.value)} />
              ))}
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Salary Range ($)</p>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 mb-0.5 block">Min</label>
                <input type="number" min="0" step="1000" value={minSalary}
                  onChange={e => setMinSalary(e.target.value)}
                  placeholder="e.g. 30000"
                  className="w-full border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-0.5 block">Max</label>
                <input type="number" min="0" step="1000" value={maxSalary}
                  onChange={e => setMaxSalary(e.target.value)}
                  placeholder="e.g. 120000"
                  className="w-full border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </aside>

        {/* ── Listings ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 max-w-none">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{loading ? '…' : total}</span> job{total !== 1 ? 's' : ''} found
            </p>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="border border-gray-300 text-sm px-3 py-1.5 text-gray-600 focus:outline-none bg-white">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Skeletons */}
          {loading && (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white border border-gray-200 p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 flex-shrink-0"/>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 w-1/2"/>
                      <div className="h-3 bg-gray-100 w-1/3"/>
                      <div className="h-3 bg-gray-100 w-2/3"/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && jobs.length === 0 && (
            <div className="bg-white border border-gray-200 text-center py-16">
              <p className="text-gray-500 text-lg font-medium">No jobs found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different filter or search term.</p>
              {hasFilter && (
                <button onClick={clearAll} className="mt-4 text-sm text-blue-600 hover:underline">Clear all filters</button>
              )}
            </div>
          )}

          <div className="space-y-3">
            {jobs.map(job => {
              const freelance = job.workMode === 'freelance';
              // acceptsBids is a computed boolean from the DTO — jobMode never exposed to candidates
              const canBid    = !!job.acceptsBids;
              const fb        = feedback[job.id];
              const salary    = fmtSalary(job);
              const sched     = !freelance && fmtSchedule(job.schedule);
              const skills    = job.skills ?? [];
              const shown     = skills.slice(0, 4);
              const extra     = skills.length - shown.length;

              return (
                <div key={job.id} className="bg-white border border-gray-200 p-5 hover:border-gray-300 transition">
                  <div className="flex gap-4">
                    <CompanyAvatar company={job.company} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base leading-tight">{job.title}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">{job.company?.name ?? '—'}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                          <Link to={`/job/${job.id}`}
                            className="text-xs text-blue-600 hover:underline whitespace-nowrap">
                            View details →
                          </Link>
                          {fb ? (
                            <span className={`text-sm font-medium ${fb.ok ? 'text-green-600' : 'text-red-600'}`}>{fb.msg}</span>
                          ) : !user ? (
                            <Link to="/login" className="px-4 py-1.5 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50 whitespace-nowrap">Sign in</Link>
                          ) : isCandidate ? (
                            freelance
                              ? canBid
                                ? <button onClick={() => setBidJob(job)} className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 whitespace-nowrap">Submit Bid</button>
                                : null
                              : <button onClick={() => apply(job)} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 whitespace-nowrap">Apply</button>
                          ) : null}
                        </div>
                      </div>

                      {/* Location + badges */}
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
                        {!freelance && job.workMode && (
                          <span className="text-xs text-gray-400">({job.workMode})</span>
                        )}
                        <span className={`text-xs font-medium px-2 py-0.5 ${TYPE_BADGE[job.employmentType] ?? TYPE_BADGE['full-time']}`}>
                          {freelance ? 'Freelance' : job.employmentType?.replace(/-/g, '‑')}
                        </span>
                        {job.experienceLevel && (
                          <span className={`text-xs font-medium px-2 py-0.5 ${EXP_BADGE[job.experienceLevel] ?? ''}`}>
                            {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}
                          </span>
                        )}
                        {/* Internship schedule badge */}
                        {sched && (
                          <span className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            {sched}
                          </span>
                        )}
                      </div>

                      {/* Skills */}
                      {shown.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {shown.map(s => <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5">{s}</span>)}
                          {extra > 0 && <span className="text-xs text-gray-400 px-1">+{extra}</span>}
                        </div>
                      )}

                      {/* Salary + meta */}
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          {salary && <span className="text-sm font-semibold text-blue-700">{salary}</span>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {freelance
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                              }
                            </svg>
                            {freelance
                              ? `${job.bidCount ?? 0} bid${(job.bidCount ?? 0) !== 1 ? 's' : ''}`
                              : `${job.applicationCount ?? 0} applicant${(job.applicationCount ?? 0) !== 1 ? 's' : ''}`}
                          </span>
                          {job.createdAt && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              {timeAgo(job.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Categories (right vertical list) ─────────────────────────── */}
        {categories.length > 0 && (
          <aside className="w-44 flex-shrink-0 bg-white border border-gray-200 sticky top-4">
            <div className="px-4 pt-4 pb-2 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">Categories</h2>
            </div>
            <div className="py-1">
              <button
                onClick={() => setCategory('')}
                className={`w-full text-left px-4 py-2 text-sm transition ${
                  !category
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategory(category === c.name ? '' : c.name)}
                  className={`w-full text-left px-4 py-2 text-sm transition ${
                    category === c.name
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </aside>
        )}
      </div>

      {bidJob && <BidModal job={bidJob} onSubmit={submitBid} onClose={() => setBidJob(null)} />}
    </PageShell>
  );
}
