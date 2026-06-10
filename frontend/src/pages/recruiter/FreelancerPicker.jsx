import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import LocationAutocomplete from '../../components/LocationAutocomplete';
import freelanceService from '../../services/freelanceService';

/**
 * Round-trip freelancer picker.
 *
 * Arrived here from JobFormModal via navigate('/recruiter/freelancers/pick', {
 *   state: { formData: { topType, ...formFields }, returnTo: '/recruiter/jobs' }
 * })
 *
 * On "Confirm selection" navigates back to returnTo with:
 *   state: { fromPicker: true, formData, selectedFreelancers: [...] }
 */
export default function FreelancerPicker() {
  const navigate  = useNavigate();
  const { state } = useLocation();

  const formData  = state?.formData  ?? {};
  const returnTo  = state?.returnTo  ?? '/recruiter/jobs';

  const [skills,   setSkills]   = useState('');
  const [location, setLoc]      = useState('');
  const [q,        setQ]        = useState('');
  const [results,  setResults]  = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [selected, setSelected] = useState({}); // { [candidateId]: freelancerObj }

  // Auto-search on first mount so the list isn't empty
  useEffect(() => { doSearch(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = {
        skills:   skills.split(',').map(s => s.trim()).filter(Boolean).join(','),
        location: location.trim(),
        q:        q.trim(),
        limit:    100,
      };
      const res = await freelanceService.searchFreelancers(params);
      setResults(res.data ?? []);
      setSearched(true);
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (freelancer) => {
    const id = String(freelancer._id ?? freelancer.id);
    setSelected(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = freelancer;
      return next;
    });
  };

  const selectedList = Object.values(selected);
  const count        = selectedList.length;

  const confirm = () => {
    navigate(returnTo, {
      replace: true,
      state: {
        fromPicker:          true,
        formData,
        selectedFreelancers: selectedList,
      },
    });
  };

  const cancel = () => {
    navigate(returnTo, {
      replace: true,
      state: {
        fromPicker:          true,
        formData,
        selectedFreelancers: null, // null = user cancelled, keep previous selection
      },
    });
  };

  return (
    <RecruiterLayout title="Select Freelancers">

      {/* ── Top action bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between page-shell-card rounded-xl px-5 py-3 mb-5">
        <p className="text-sm text-gray-600">
          {count === 0
            ? 'Select one or more freelancers to invite.'
            : <><strong>{count}</strong> freelancer{count !== 1 ? 's' : ''} selected</>}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={cancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back to form
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={count === 0}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirm selection{count > 0 ? ` (${count})` : ''}
          </button>
        </div>
      </div>

      {/* ── Search form ─────────────────────────────────────────────────── */}
      <form onSubmit={doSearch} className="page-shell-card rounded-xl p-4 mb-5 grid md:grid-cols-4 gap-3">
        <input
          value={skills}
          onChange={e => setSkills(e.target.value)}
          placeholder="Skills (comma-separated)"
          className="page-shell-field px-3 py-2 text-sm text-gray-700 rounded-md focus:outline-none"
        />
        <LocationAutocomplete
          value={location}
          onChange={setLoc}
          placeholder="Location"
          className="focus:ring-indigo-500"
        />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Name or headline"
          className="page-shell-field px-3 py-2 text-sm text-gray-700 rounded-md focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* ── Freelancer list ─────────────────────────────────────────────── */}
      {searched && results.length === 0 && !loading && (
        <div className="page-shell-card rounded-xl text-center py-16 text-gray-400">
          <p className="text-lg">No freelancers found</p>
          <p className="text-sm mt-1">Only candidates with Freelance Mode activated are shown.</p>
        </div>
      )}

      <div className="space-y-2">
        {results.map(c => {
          const id       = String(c._id ?? c.id);
          const isChecked = !!selected[id];
          return (
            <label
              key={id}
              className={`flex items-start gap-4 bg-white border-2 px-5 py-4 cursor-pointer transition ${
                isChecked ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(c)}
                className="mt-1 h-4 w-4 accent-indigo-600 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{c.firstName} {c.lastName}</p>
                {c.headline  && <p className="text-sm text-indigo-600 mt-0.5">{c.headline}</p>}
                {c.location  && <p className="text-sm text-gray-500">{c.location}</p>}
                {c.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {c.skills.map(s => (
                      <span key={s.skillId ?? s.name} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5">
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {isChecked && (
                <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 self-start flex-shrink-0">
                  Selected
                </span>
              )}
            </label>
          );
        })}
      </div>

      {/* Floating confirm bar when something is selected */}
      {count > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white px-6 py-3 shadow-2xl flex items-center gap-4">
          <span className="text-sm">{count} freelancer{count !== 1 ? 's' : ''} selected</span>
          <button
            type="button"
            onClick={confirm}
            className="px-4 py-1.5 bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400"
          >
            Confirm selection
          </button>
        </div>
      )}
    </RecruiterLayout>
  );
}
