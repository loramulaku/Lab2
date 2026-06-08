import { useEffect, useState } from 'react';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import freelanceService from '../../services/freelanceService';

/**
 * Active Freelancers — browse candidates with Freelance Mode activated.
 * Only candidates with Freelance Mode activated are returned (enforced
 * server-side in SearchFreelancersHandler).
 */
export default function SearchInvite() {
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-load all active freelancers on mount
    setLoading(true);
    freelanceService.searchFreelancers({ limit: 200 })
      .then(res => { setResults(res.data ?? []); setSearched(true); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const search = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = {
        skills: skills.split(',').map(s => s.trim()).filter(Boolean).join(','),
        location: location.trim(),
        q: q.trim(),
        limit: 50,
      };
      const res = await freelanceService.searchFreelancers(params);
      setResults(res.data ?? []);
      setSearched(true);
    } catch {
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecruiterLayout title="Active Freelancers">
      <form onSubmit={search} className="bg-white border border-gray-200 p-4 mb-6 grid md:grid-cols-4 gap-3">
        <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="Skills (comma-separated)"
          className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location"
          className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Name or headline"
          className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {searched && results.length === 0 && !loading && (
        <div className="bg-white border border-gray-200 text-center py-16 text-gray-400">
          <p className="text-lg">No freelancers match your search</p>
          <p className="text-sm mt-1">Only candidates with Freelance Mode activated are shown.</p>
        </div>
      )}

      <div className="space-y-3">
        {results.map(c => (
          <div key={c._id} className="bg-white border border-gray-200 px-5 py-4">
            <h3 className="font-semibold text-gray-900">{c.firstName} {c.lastName}</h3>
            {c.headline && <p className="text-sm text-blue-600 mt-0.5">{c.headline}</p>}
            {c.location && <p className="text-sm text-gray-500">{c.location}</p>}
            {c.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {c.skills.map(s => (
                  <span key={s.skillId ?? s.name} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5">{s.name}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </RecruiterLayout>
  );
}
