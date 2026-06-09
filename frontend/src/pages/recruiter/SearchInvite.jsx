import { useEffect, useState } from 'react';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import freelanceService from '../../services/freelanceService';

const lc = s => (s ?? '').toLowerCase();

export default function SearchInvite() {
  const [q,       setQ]       = useState('');
  const [all,     setAll]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    freelanceService.searchFreelancers({ limit: 500 })
      .then(res => setAll(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const term    = lc(q);
  const visible = term
    ? all.filter(c => {
        const name     = lc(`${c.firstName} ${c.lastName}`);
        const headline = lc(c.headline);
        const location = lc(c.location);
        const skills   = (c.skills ?? []).map(s => lc(s.name)).join(' ');
        return name.includes(term) || headline.includes(term) || location.includes(term) || skills.includes(term);
      })
    : all;

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
          <p className="text-base">No results for "{q}"</p>
          <button onClick={() => setQ('')} className="mt-3 text-sm text-blue-600 hover:underline">
            Clear search
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3">
            {visible.length} of {all.length} freelancer{all.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-3">
            {visible.map(c => (
              <div key={c._id} className="page-shell-card rounded-xl px-5 py-4">
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
            ))}
          </div>
        </>
      )}
    </RecruiterLayout>
  );
}
