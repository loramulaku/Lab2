import { useEffect, useState, useCallback, useMemo } from 'react';

const PAGE_SIZE = 20;
import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import StatusBadge from '../../components/recruiter/StatusBadge';
import recruiterService from '../../services/recruiterService';
import freelanceService from '../../services/freelanceService';

/**
 * Freelance Applicants — freelancers who applied (bid) on the recruiter's
 * public freelance job posts. Each row offers "Continue" → live chat /
 * contract creation, plus inline Accept (hire) for pending bids.
 */
export default function FreelanceApplicants() {
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(bids.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = useMemo(
    () => bids.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [bids, safePage]
  );

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
      setError('Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const accept = async (id) => {
    setBusy(id);
    try { await freelanceService.acceptBid(id); await load(); }
    catch (e) { setError(e?.response?.data?.message || 'Action failed.'); }
    finally { setBusy(null); }
  };

  return (
    <RecruiterLayout title="Freelance Applicants">
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? <p className="text-sm text-gray-400">Loading…</p>
        : bids.length === 0 ? (
          <div className="page-shell-card rounded-xl text-center py-16 text-gray-400">
            <p className="text-lg">No freelance applicants yet</p>
            <p className="text-sm mt-1">Freelancers who bid on your public freelance jobs appear here.</p>
          </div>
        ) : (
          <>
          <p className="text-xs text-gray-400 mb-3">
            {bids.length} applicant{bids.length !== 1 ? 's' : ''}
            {totalPages > 1 && ` · page ${safePage} of ${totalPages}`}
          </p>
          <div className="space-y-3">
            {pageItems.map(b => (
              <div key={b.id} className="page-shell-card rounded-xl px-5 py-4 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {b.freelancer ? `${b.freelancer.firstName} ${b.freelancer.lastName}` : `Freelancer #${b.freelancerId}`}
                    </h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{b.jobTitle}</p>
                  <p className="text-sm text-gray-700 mt-1">${Number(b.price).toLocaleString()} · {b.deliveryTimeDays} days</p>
                </div>
                <div className="flex gap-2">
                  {b.status === 'pending' && (
                    <button disabled={busy === b.id} onClick={() => accept(b.id)}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50">Hire</button>
                  )}
                  <button onClick={() => navigate('/chat')}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">Continue</button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40">← Prev</button>
              <span className="text-sm text-gray-500">{safePage} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40">Next →</button>
            </div>
          )}
          </>
        )}
    </RecruiterLayout>
  );
}
