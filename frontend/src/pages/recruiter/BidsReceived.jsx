import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import StatusBadge from '../../components/recruiter/StatusBadge';
import recruiterService from '../../services/recruiterService';
import freelanceService from '../../services/freelanceService';

/**
 * All bids submitted on the recruiter's public freelance jobs (Mode A).
 * Aggregated across every job that accepts bids (jobMode public|both).
 */
export default function BidsReceived() {
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profile = await recruiterService.getProfile();
      const cid = profile?.company?.id ?? null;
      const jobsRes = await recruiterService.listJobs({ companyId: cid, employmentType: 'freelance', limit: 200 });
      const biddable = (jobsRes.data ?? []).filter(j => ['public', 'both'].includes(j.jobMode));
      const perJob = await Promise.all(
        biddable.map(j => freelanceService.bidsByJob(j.id, { limit: 200 })
          .then(r => (r.data ?? []).map(b => ({ ...b, jobTitle: b.jobTitle ?? j.title })))
          .catch(() => []))
      );
      setBids(perJob.flat());
    } catch {
      setError('Failed to load bids.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (fn, id) => {
    setBusy(id);
    try { await fn(id); await load(); }
    catch (e) { setError(e?.response?.data?.message || 'Action failed.'); }
    finally { setBusy(null); }
  };

  return (
    <RecruiterLayout title="Bids Received">
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? <p className="text-sm text-gray-400">Loading…</p>
        : bids.length === 0 ? (
          <div className="bg-white border border-gray-200 text-center py-16 text-gray-400">
            <p className="text-lg">No bids yet</p>
            <p className="text-sm mt-1">Bids on your public freelance jobs will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bids.map(b => (
              <div key={b.id} className="bg-white border border-gray-200 px-5 py-4 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {b.freelancer ? `${b.freelancer.firstName} ${b.freelancer.lastName}` : `Freelancer #${b.freelancerId}`}
                    </h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{b.jobTitle}</p>
                  <p className="text-sm text-gray-700 mt-1">${Number(b.price).toLocaleString()} · {b.deliveryTimeDays} days</p>
                  {b.message && <p className="text-sm text-gray-500 mt-1">{b.message}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {b.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button disabled={busy === b.id} onClick={() => act(freelanceService.acceptBid, b.id)}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50">Accept &amp; Hire</button>
                      <button disabled={busy === b.id} onClick={() => act(freelanceService.rejectBid, b.id)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50 disabled:opacity-50">Reject</button>
                    </div>
                  ) : (
                    <button onClick={() => navigate('/chat')}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">Continue</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </RecruiterLayout>
  );
}
