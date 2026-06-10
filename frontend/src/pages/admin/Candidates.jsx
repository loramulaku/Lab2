import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../services/adminApi';
import { useDebounce } from '../../hooks/useDebounce';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';
const PAGE_SIZE = 18;

const TINTS = [
  'bg-blue-500', 'bg-indigo-500', 'bg-emerald-500',
  'bg-violet-500', 'bg-amber-500', 'bg-teal-500',
  'bg-rose-500', 'bg-cyan-500',
];

function tint(name) {
  const n = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return TINTS[n % TINTS.length];
}

function initials(first, last) {
  return [first?.[0], last?.[0]].filter(Boolean).join('').toUpperCase() || '?';
}

function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-1.5 bg-gray-200 w-full" />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-xl bg-gray-200" />
          <div className="w-16 h-4 bg-gray-200 rounded-full" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1.5" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="flex gap-1 mb-4">
          {[1,2,3].map(i => <div key={i} className="h-4 w-14 bg-gray-200 rounded" />)}
        </div>
        <div className="pt-3 border-t border-gray-100">
          <div className="h-7 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ candidate: c, onView }) {
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ');
  const bg = tint(name);

  return (
    <div className="bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-1.5 w-full ${bg} opacity-70`} />
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center text-white font-bold text-base flex-shrink-0`}>
            {initials(c.firstName, c.lastName)}
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {c.freelanceActive && (
              <span className="text-[10px] font-semibold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Freelance</span>
            )}
            {c.yearsExperience != null && (
              <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {c.yearsExperience} yr{c.yearsExperience !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <p className="font-semibold text-gray-900 text-sm leading-tight">{name || '—'}</p>
        {c.headline && <p className="text-xs text-indigo-600 mt-0.5 line-clamp-1">{c.headline}</p>}
        <p className="text-xs text-gray-400 mt-0.5 truncate">{c.email}{c.location ? ` · ${c.location}` : ''}</p>

        {c.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {c.skills.slice(0, 4).map(s => (
              <span key={s.skillId ?? s.name} className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                {s.name}
              </span>
            ))}
            {c.skills.length > 4 && <span className="text-[11px] text-gray-400 px-1.5 py-0.5">+{c.skills.length - 4}</span>}
          </div>
        )}

        <div className="flex-1" />

        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => onView(c)}
            className="w-full py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileModal({ candidate: c, onClose }) {
  if (!c) return null;
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ');
  const bg = tint(name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onMouseDown={onClose}>
      <div
        className="bg-white w-full max-w-2xl rounded-xl border border-gray-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-xl ${bg} flex items-center justify-center text-white font-bold text-lg`}>
              {initials(c.firstName, c.lastName)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
                {c.freelanceActive && (
                  <span className="text-[11px] font-medium bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Freelance</span>
                )}
              </div>
              {c.headline && <p className="text-sm text-indigo-600">{c.headline}</p>}
              <p className="text-xs text-gray-500">{c.email}{c.location ? ` · ${c.location}` : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none flex-shrink-0">&times;</button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Experience', value: c.yearsExperience != null ? `${c.yearsExperience} yrs` : '—' },
              { label: 'Skills', value: c.stats?.skillsListed ?? c.skills?.length ?? 0 },
              { label: 'Jobs', value: c.stats?.workExperiences ?? c.experiences?.length ?? 0 },
              { label: 'Education', value: c.stats?.educationRecords ?? c.educations?.length ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg px-3 py-2 text-center border border-gray-100">
                <p className="text-lg font-bold text-gray-900">{value}</p>
                <p className="text-[11px] text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {c.phone && <div><span className="text-xs font-semibold text-gray-400 block">Phone</span><span>{c.phone}</span></div>}
            {c.willingToRelocate != null && (
              <div>
                <span className="text-xs font-semibold text-gray-400 block">Willing to relocate</span>
                <span className={c.willingToRelocate ? 'text-green-600 font-medium' : ''}>{c.willingToRelocate ? 'Yes' : 'No'}</span>
              </div>
            )}
            {c.linkedinUrl && (
              <div>
                <span className="text-xs font-semibold text-gray-400 block">LinkedIn</span>
                <a href={c.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block">{c.linkedinUrl}</a>
              </div>
            )}
            {c.githubUrl && (
              <div>
                <span className="text-xs font-semibold text-gray-400 block">GitHub</span>
                <a href={c.githubUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block">{c.githubUrl}</a>
              </div>
            )}
          </div>

          {c.bio && (
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-1">About</span>
              <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3 leading-relaxed">{c.bio}</p>
            </div>
          )}

          {c.cvPath && (
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-1">CV / Resume</span>
              <a href={`${API_BASE}${c.cvPath}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View CV
              </a>
            </div>
          )}

          {c.skills?.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-2">Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {c.skills.map(s => (
                  <span key={s.skillId ?? s.name} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">
                    {s.name}{s.level ? ` · ${s.level}` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {c.experiences?.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-2">Experience</span>
              <div className="space-y-2">
                {c.experiences.map((exp, i) => (
                  <div key={exp.id ?? i} className="border border-gray-100 rounded-lg p-3">
                    <p className="font-medium text-gray-900 text-sm">{exp.title}</p>
                    <p className="text-xs text-gray-500">{exp.company}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {exp.startDate ? new Date(exp.startDate).getFullYear() : '?'} — {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                    </p>
                    {exp.description && <p className="text-xs text-gray-600 mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {c.educations?.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-2">Education</span>
              <div className="space-y-2">
                {c.educations.map((edu, i) => (
                  <div key={edu.id ?? i} className="border border-gray-100 rounded-lg p-3">
                    <p className="font-medium text-gray-900 text-sm">{edu.degree}</p>
                    <p className="text-xs text-gray-500">{edu.institution}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{edu.startYear} — {edu.endYear ?? 'Present'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  const [q,             setQ]            = useState('');
  const [skillsInput,   setSkillsInput]  = useState('');
  const [location,      setLocation]     = useState('');
  const [freelanceOnly, setFreelanceOnly] = useState(false);

  const dq  = useDebounce(q,           350);
  const dsk = useDebounce(skillsInput, 350);
  const dloc= useDebounce(location,    350);

  const [viewing, setViewing] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = q || skillsInput || location || freelanceOnly;

  const load = useCallback(async (pg) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: pg,
        limit: PAGE_SIZE,
        ...(dq  && { q: dq }),
        ...(dsk  && { skills: dsk }),
        ...(dloc && { location: dloc }),
        ...(freelanceOnly && { freelanceActive: 'true' }),
      };
      const res = await adminApi.getCandidates(params);
      setCandidates(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch {
      setError('Failed to load candidates.');
    } finally {
      setLoading(false);
    }
  }, [dq, dsk, dloc, freelanceOnly]);

  useEffect(() => { setPage(1); }, [dq, dsk, dloc, freelanceOnly]);
  useEffect(() => { load(page); }, [dq, dsk, dloc, freelanceOnly, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearFilters = () => { setQ(''); setSkillsInput(''); setLocation(''); setFreelanceOnly(false); };

  return (
    <div>
      <div className="flex items-end justify-between mb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Candidates</h2>
          {!loading && <p className="text-sm text-gray-500 mt-0.5">{total.toLocaleString()} total</p>}
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-800 underline">
            Clear filters
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-center">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Name or headline…"
            className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
        </div>
        <input
          value={skillsInput}
          onChange={e => setSkillsInput(e.target.value)}
          placeholder="Skills, e.g. React, Node"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Location"
            className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
        </div>
        <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer select-none px-2 py-2">
          <input
            type="checkbox"
            checked={freelanceOnly}
            onChange={e => setFreelanceOnly(e.target.checked)}
            className="h-4 w-4 accent-teal-600 flex-shrink-0"
          />
          Freelance only
        </label>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl text-center py-20">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-base font-medium text-gray-700">No candidates found</p>
          <p className="text-sm text-gray-400 mt-1">
            {hasFilters ? 'Try adjusting your filters.' : 'No candidate profiles yet.'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 text-sm text-indigo-600 hover:underline">Clear filters</button>
          )}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map(c => (
              <CandidateCard key={c._id ?? c.id} candidate={c} onView={setViewing} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-500 px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {viewing && <ProfileModal candidate={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
