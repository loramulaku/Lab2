import { useEffect, useState, useMemo } from 'react';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import freelanceService from '../../services/freelanceService';
import { useDebounce } from '../../hooks/useDebounce';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';

function CandidateAvatar({ avatarPath, name }) {
  const initials = name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  if (avatarPath) {
    return (
      <img
        src={`${API_BASE}${avatarPath}`}
        alt={name}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-200"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex items-center justify-center flex-shrink-0">
      {initials || '?'}
    </div>
  );
}

const PAGE_SIZE = 20;
const lc = s => (s ?? '').toLowerCase();

export default function SearchInvite() {
  const [q,       setQ]       = useState('');
  const [all,     setAll]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);

  const debouncedQ = useDebounce(q, 300);

  useEffect(() => {
    freelanceService.searchFreelancers({ limit: 500 })
      .then(res => setAll(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [debouncedQ]);

  const visible = useMemo(() => {
    const term = lc(debouncedQ);
    if (!term) return all;
    return all.filter(c => {
      const name     = lc(`${c.firstName} ${c.lastName}`);
      const headline = lc(c.headline);
      const location = lc(c.location);
      const skills   = (c.skills ?? []).map(s => lc(s.name)).join(' ');
      return name.includes(term) || headline.includes(term) || location.includes(term) || skills.includes(term);
    });
  }, [all, debouncedQ]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = useMemo(
    () => visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [visible, safePage]
  );

  return (
    <RecruiterLayout title="Active Freelancers">

      <div className="page-shell-card rounded-xl px-4 py-3 mb-6">
        <input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by name, headline, location or skill…"
          className="w-full border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : all.length === 0 ? (
        <div className="page-shell-card rounded-xl text-center py-16 text-gray-400">
          <p className="text-lg">No active freelancers yet</p>
          <p className="text-sm mt-1">Only candidates with Freelance Mode activated are shown.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="page-shell-card rounded-xl text-center py-10 text-gray-400">
          <p className="text-base">No results for "{debouncedQ}"</p>
          <button onClick={() => setQ('')} className="mt-3 text-sm text-blue-600 hover:underline">
            Clear search
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3">
            {visible.length} of {all.length} freelancer{all.length !== 1 ? 's' : ''}
            {totalPages > 1 && ` · page ${safePage} of ${totalPages}`}
          </p>
          <div className="space-y-3">
            {pageItems.map(c => (
              <div key={c._id} className="page-shell-card rounded-xl px-5 py-4 flex items-start gap-4">
                <CandidateAvatar
                  avatarPath={c.avatarPath}
                  name={`${c.firstName ?? ''} ${c.lastName ?? ''}`}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">{c.firstName} {c.lastName}</h3>
                  {c.headline  && <p className="text-sm text-blue-600 mt-0.5">{c.headline}</p>}
                  {c.location  && <p className="text-sm text-gray-500">{c.location}</p>}
                  {c.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {c.skills.map(s => (
                        <span key={s.skillId ?? s.name} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-500">{safePage} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </RecruiterLayout>
  );
}
