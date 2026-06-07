import { useEffect, useState } from 'react';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import recruiterService from '../../services/recruiterService';
import freelanceService from '../../services/freelanceService';

/**
 * Active Freelancers — Mode B "Search & Invite".
 * Only candidates with Freelance Mode activated are returned (enforced
 * server-side in SearchFreelancersHandler). The recruiter selects one of their
 * invite-enabled freelance jobs and sends a direct invitation.
 */
export default function SearchInvite() {
  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteFor, setInviteFor] = useState(null); // candidate

  useEffect(() => {
    (async () => {
      try {
        const profile = await recruiterService.getProfile();
        const cid = profile?.company?.id ?? null;
        const res = await recruiterService.listJobs({ companyId: cid, employmentType: 'freelance', limit: 200 });
        setJobs((res.data ?? []).filter(j => ['invite', 'both'].includes(j.jobMode) && j.status === 'open'));
      } catch { /* ignore */ }
    })();
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
      {jobs.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 px-4 py-3 mb-4 text-sm text-yellow-800">
          You have no open freelance jobs that allow invitations. Post a job with hiring mode
          <strong> Search &amp; Invite</strong> or <strong>Both</strong> to send invitations.
        </div>
      )}

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
          <div key={c._id} className="bg-white border border-gray-200 px-5 py-4 flex justify-between items-start gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900">{c.firstName} {c.lastName}</h3>
              {c.headline && <p className="text-sm text-blue-600">{c.headline}</p>}
              {c.location && <p className="text-sm text-gray-500">{c.location}</p>}
              {c.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {c.skills.map(s => (
                    <span key={s.skillId ?? s.name} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5">{s.name}</span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setInviteFor(c)} disabled={jobs.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap">
              Invite
            </button>
          </div>
        ))}
      </div>

      {inviteFor && (
        <InviteModal
          candidate={inviteFor}
          jobs={jobs}
          onClose={() => setInviteFor(null)}
          onSent={() => setInviteFor(null)}
        />
      )}
    </RecruiterLayout>
  );
}

function InviteModal({ candidate, jobs, onClose, onSent }) {
  const [jobId, setJobId] = useState(jobs[0]?.id ?? '');
  const [priceOffer, setPrice] = useState('');
  const [deliveryTimeDays, setDelivery] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!jobId) { setError('Select a job to invite for.'); return; }
    setSending(true);
    setError('');
    try {
      await freelanceService.sendInvitation({
        jobId: Number(jobId),
        freelancerId: Number(candidate._id),
        title: jobs.find(j => j.id === Number(jobId))?.title,
        priceOffer: priceOffer ? Number(priceOffer) : undefined,
        deliveryTimeDays: deliveryTimeDays ? Number(deliveryTimeDays) : undefined,
        message: message.trim() || undefined,
      });
      onSent();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send invitation.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/75 px-4" onMouseDown={onClose}>
      <div className="bg-white w-full max-w-md border border-gray-200 shadow-xl" onMouseDown={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Invite {candidate.firstName} {candidate.lastName}</h3>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job</label>
            <select value={jobId} onChange={e => setJobId(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offered price ($)</label>
              <input type="number" min="1" value={priceOffer} onChange={e => setPrice(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 2000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
              <input type="number" min="1" value={deliveryTimeDays} onChange={e => setDelivery(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 21" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell them about the project…" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={sending} className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {sending ? 'Sending…' : 'Send Invitation'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
