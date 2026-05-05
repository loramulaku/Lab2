import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getJobs } from '../../services/jobs';
import { useAuth } from '../../hooks/useAuth';

const CATEGORIES   = ['All', 'Engineering', 'Design', 'Data', 'DevOps', 'Security', 'Marketing', 'Product'];
const JOB_TYPES    = ['Full-Time', 'Part-Time', 'Freelance', 'Contract'];
const EXP_LEVELS   = ['Entry', 'Mid', 'Senior', 'Lead'];
const SORT_OPTIONS = ['Relevance', 'Newest', 'Salary'];

const TYPE_MAP = { 'Full-Time': 'full-time', 'Part-Time': 'part-time', 'Freelance': 'freelance', 'Contract': 'contract' };

function typeBadgeClass(type) {
  if (type === 'full-time')  return 'badge badge-blue';
  if (type === 'freelance')  return 'badge badge-purple';
  return 'badge badge-gray';
}

function levelBadgeClass(level) {
  if (level === 'senior') return 'badge badge-amber';
  if (level === 'junior' || level === 'entry') return 'badge badge-green';
  if (level === 'lead')   return 'badge badge-red';
  return 'badge badge-blue';
}

function CompanyLogo({ name }) {
  const colors = ['#DBEAFE', '#EDE9FE', '#FEF3C7', '#D1FAE5', '#FEE2E2', '#F0FDF4'];
  const textColors = ['#1D4ED8', '#6D28D9', '#B45309', '#065F46', '#991B1B', '#15803D'];
  const idx = (name?.charCodeAt(0) ?? 0) % colors.length;
  return (
    <div style={{ width: 48, height: 48, borderRadius: 10, background: colors[idx], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: textColors[idx], flexShrink: 0 }}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export default function JobList() {
  const { isRecruiter } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [result,    setResult]    = useState({ data: [], total: 0, pages: 1 });
  const [loading,   setLoading]   = useState(true);
  const [category,  setCategory]  = useState('All');
  const [typeFilters,  setTypeFilters]  = useState([]);
  const [levelFilters, setLevelFilters] = useState([]);
  const [remoteOnly,   setRemoteOnly]   = useState(false);
  const [freelanceOnly,setFreelanceOnly]= useState(false);
  const [minSalary,    setMinSalary]    = useState(0);
  const [sort,         setSort]         = useState('Relevance');

  const q        = searchParams.get('q')        ?? '';
  const location = searchParams.get('location') ?? '';
  const page     = Number(searchParams.get('page') ?? 1);

  useEffect(() => {
    setLoading(true);
    const params = { status: 'open', page };
    if (q)               params.q              = q;
    if (location)        params.location       = location;
    if (typeFilters.length === 1) params.employmentType = TYPE_MAP[typeFilters[0]];
    if (freelanceOnly)   params.employmentType = 'freelance';

    getJobs(params)
      .then(setResult)
      .finally(() => setLoading(false));
  }, [q, location, page, typeFilters, freelanceOnly]);

  function setParam(key, val) {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  }

  function toggleFilter(arr, setArr, val) {
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  }

  const filtered = result.data.filter(job => {
    if (levelFilters.length && job.experienceLevel && !levelFilters.map(l => l.toLowerCase()).includes(job.experienceLevel)) return false;
    if (remoteOnly && job.workMode !== 'remote') return false;
    if (minSalary > 0 && job.budgetMin && job.budgetMin < minSalary) return false;
    return true;
  });

  return (
    <div>
      {/* ── Hero ─────────────────────────────────── */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>Find Your Next Opportunity</h1>
        <p style={s.heroSub}>{result.total} jobs available</p>
        <div style={s.searchBar}>
          <div style={s.searchLeft}>
            <svg width="18" height="18" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24" style={{flexShrink:0}}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              style={s.searchInput}
              placeholder="Job title, skill, or company..."
              value={q}
              onChange={e => setParam('q', e.target.value)}
            />
          </div>
          <div style={s.searchDivider} />
          <div style={s.searchRight}>
            <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24" style={{flexShrink:0}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <input
              style={s.searchInput}
              placeholder="Location or Remote"
              value={location}
              onChange={e => setParam('location', e.target.value)}
            />
          </div>
          <button style={s.searchBtn}>Search</button>
        </div>
      </div>

      {/* ── Category pills ───────────────────────── */}
      <div style={s.catRow}>
        <div style={s.catInner}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              style={{ ...s.catPill, ...(category === cat ? s.catPillActive : {}) }}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        {isRecruiter && (
          <Link to="/jobs/new" className="btn-primary" style={{ marginLeft: 'auto', flexShrink: 0 }}>
            + Post a Job
          </Link>
        )}
      </div>

      {/* ── Main layout ──────────────────────────── */}
      <div style={s.main}>
        {/* Sidebar */}
        <aside style={s.sidebar}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={s.filterTitle}>Filters</h3>

            <p style={s.filterSection}>Job Type</p>
            {JOB_TYPES.map(t => (
              <label key={t} style={s.checkRow}>
                <input type="checkbox" style={s.checkbox}
                  checked={typeFilters.includes(t)}
                  onChange={() => toggleFilter(typeFilters, setTypeFilters, t)} />
                {t}
              </label>
            ))}

            <p style={{ ...s.filterSection, marginTop: '1.25rem' }}>Experience Level</p>
            {EXP_LEVELS.map(l => (
              <label key={l} style={s.checkRow}>
                <input type="checkbox" style={s.checkbox}
                  checked={levelFilters.includes(l)}
                  onChange={() => toggleFilter(levelFilters, setLevelFilters, l)} />
                {l}
              </label>
            ))}

            <p style={{ ...s.filterSection, marginTop: '1.25rem' }}>
              Min Salary: {minSalary > 0 ? `$${(minSalary/1000).toFixed(0)}k` : 'Any'}
            </p>
            <input type="range" min={0} max={150000} step={5000}
              value={minSalary} onChange={e => setMinSalary(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#2563EB' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9CA3AF' }}>
              <span>$0</span><span>$150k</span>
            </div>

            <div style={s.toggleRow}>
              <span style={s.toggleLabel}>Remote Only</span>
              <button style={{ ...s.toggle, background: remoteOnly ? '#2563EB' : '#D1D5DB' }}
                onClick={() => setRemoteOnly(v => !v)}>
                <span style={{ ...s.toggleThumb, transform: remoteOnly ? 'translateX(18px)' : 'translateX(2px)' }} />
              </button>
            </div>
            <div style={s.toggleRow}>
              <span style={s.toggleLabel}>Freelance Only</span>
              <button style={{ ...s.toggle, background: freelanceOnly ? '#2563EB' : '#D1D5DB' }}
                onClick={() => setFreelanceOnly(v => !v)}>
                <span style={{ ...s.toggleThumb, transform: freelanceOnly ? 'translateX(18px)' : 'translateX(2px)' }} />
              </button>
            </div>
          </div>
        </aside>

        {/* Job list */}
        <div style={s.listCol}>
          <div style={s.listHeader}>
            <p style={s.count}><strong>{filtered.length}</strong> jobs found</p>
            <select style={s.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {loading && <p style={{ color: '#6B7280', padding: '2rem 0' }}>Loading...</p>}

          <div style={s.cards}>
            {filtered.map(job => (
              <Link key={job.id} to={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card" style={s.jobCard}>
                  <div style={s.jobTop}>
                    <CompanyLogo name={job.company?.name} />
                    <div style={s.jobMid}>
                      <h3 style={s.jobTitle}>{job.title}</h3>
                      <p style={s.jobCompany}>{job.company?.name ?? '—'}</p>
                      <div style={s.jobMeta}>
                        {job.workMode && (
                          <span style={s.location}>
                            <svg width="12" height="12" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {job.workMode}
                          </span>
                        )}
                        {job.employmentType && (
                          <span className={typeBadgeClass(job.employmentType)}>
                            {job.employmentType === 'full-time' ? 'Full-Time' : job.employmentType === 'freelance' ? 'Freelance' : job.employmentType}
                          </span>
                        )}
                        {job.experienceLevel && (
                          <span className={levelBadgeClass(job.experienceLevel)}>
                            {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}
                          </span>
                        )}
                        {job.jobMode && job.employmentType === 'freelance' && (
                          <span className="badge badge-gray">
                            {job.jobMode.charAt(0).toUpperCase() + job.jobMode.slice(1)}
                          </span>
                        )}
                      </div>
                      {job.skills?.length > 0 && (
                        <div style={s.skills}>
                          {job.skills.slice(0, 4).map(sk => (
                            <span key={sk} className="skill-tag">{sk}</span>
                          ))}
                          {job.skills.length > 4 && <span className="skill-tag">+{job.skills.length - 4}</span>}
                        </div>
                      )}
                    </div>
                    <button style={s.bookmark} onClick={e => e.preventDefault()} title="Save">
                      <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    </button>
                  </div>

                  <div style={s.jobBottom}>
                    {(job.budgetMin || job.budgetMax) ? (
                      <span style={s.salary}>
                        ${job.budgetMin?.toLocaleString() ?? '?'}–${job.budgetMax?.toLocaleString() ?? '?'}{job.employmentType === 'full-time' ? '/yr' : ''}
                      </span>
                    ) : <span />}
                    <div style={s.jobStats}>
                      {job.applicationCount > 0 && (
                        <span style={s.stat}>
                          <svg width="13" height="13" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          {job.applicationCount}
                        </span>
                      )}
                      {job.createdAt && (
                        <span style={s.stat}>
                          <svg width="13" height="13" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          {Math.floor((Date.now() - new Date(job.createdAt)) / 86400000)}d ago
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#9CA3AF' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No jobs found</p>
                <p style={{ fontSize: '0.875rem' }}>Try adjusting your filters</p>
              </div>
            )}
          </div>

          {result.pages > 1 && (
            <div style={s.pagination}>
              {page > 1 && <button style={s.pageBtn} onClick={() => setParam('page', page - 1)}>← Prev</button>}
              <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>Page {page} of {result.pages}</span>
              {page < result.pages && <button style={s.pageBtn} onClick={() => setParam('page', page + 1)}>Next →</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  hero:       { background: '#2B3A8C', padding: '3rem 2rem 3.5rem', textAlign: 'center' },
  heroTitle:  { color: '#fff', fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '-0.02em' },
  heroSub:    { color: 'rgba(255,255,255,0.65)', fontSize: '1rem', marginBottom: '1.75rem' },
  searchBar:  { display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 999, maxWidth: 740, margin: '0 auto', padding: '0.35rem 0.35rem 0.35rem 1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', gap: 0 },
  searchLeft: { display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 2 },
  searchRight:{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1.2, paddingLeft: '1rem' },
  searchDivider:{ width: 1, height: 28, background: '#E5E7EB', flexShrink: 0 },
  searchInput:{ border: 'none', outline: 'none', fontSize: '0.9rem', width: '100%', color: '#111827', background: 'transparent' },
  searchBtn:  { padding: '0.6rem 1.5rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 999, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', flexShrink: 0 },

  catRow:     { background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0.875rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto' },
  catInner:   { display: 'flex', gap: '0.5rem' },
  catPill:    { padding: '0.4rem 1rem', borderRadius: 999, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' },
  catPillActive:{ background: '#2563EB', borderColor: '#2563EB', color: '#fff' },

  main:       { display: 'flex', gap: '1.5rem', maxWidth: 1200, margin: '1.75rem auto', padding: '0 1.5rem', alignItems: 'flex-start' },
  sidebar:    { width: 240, flexShrink: 0, position: 'sticky', top: 80 },
  filterTitle:{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.1rem' },
  filterSection:{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', margin: '0 0 0.5rem' },
  checkRow:   { display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.875rem', color: '#374151', cursor: 'pointer', padding: '0.25rem 0' },
  checkbox:   { accentColor: '#2563EB', width: 15, height: 15, cursor: 'pointer' },
  toggleRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' },
  toggleLabel:{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 },
  toggle:     { width: 40, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', padding: 0 },
  toggleThumb:{ position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },

  listCol:    { flex: 1, minWidth: 0 },
  listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  count:      { fontSize: '0.9rem', color: '#6B7280' },
  sortSelect: { padding: '0.4rem 0.75rem', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: '0.875rem', color: '#374151', background: '#fff', cursor: 'pointer' },

  cards:      { display: 'flex', flexDirection: 'column', gap: '0.875rem' },
  jobCard:    { padding: '1.25rem 1.5rem', transition: 'box-shadow 0.15s', cursor: 'pointer' },
  jobTop:     { display: 'flex', gap: '1rem', alignItems: 'flex-start' },
  jobMid:     { flex: 1, minWidth: 0 },
  jobTitle:   { fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '0.2rem' },
  jobCompany: { fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' },
  jobMeta:    { display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' },
  location:   { display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.8rem', color: '#6B7280' },
  skills:     { display: 'flex', gap: '0.35rem', flexWrap: 'wrap' },
  bookmark:   { background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem', flexShrink: 0 },
  jobBottom:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid #F3F4F6' },
  salary:     { fontWeight: 700, color: '#2563EB', fontSize: '0.95rem' },
  jobStats:   { display: 'flex', gap: '0.75rem' },
  stat:       { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#9CA3AF' },

  pagination: { display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', marginTop: '2rem', paddingBottom: '2rem' },
  pageBtn:    { padding: '0.4rem 1rem', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', background: '#fff', fontSize: '0.875rem' },
};
