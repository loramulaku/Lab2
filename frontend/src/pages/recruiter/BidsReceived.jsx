import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import StatusBadge from '../../components/recruiter/StatusBadge';
import ContractModal from '../../components/recruiter/ContractModal';
import recruiterService from '../../services/recruiterService';
import freelanceService from '../../services/freelanceService';

/**
 * Bids Received — all pending bids on the recruiter's public freelance jobs (Mode A).
 * Buttons per row: Rejected · Live Chat · Make a Contract
 */
export default function BidsReceived() {
  const navigate  = useNavigate();
  const [bids,    setBids]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [busy,    setBusy]    = useState(null);
  const [contractTarget, setContractTarget] = useState(null); // bid row for modal

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profile  = await recruiterService.getProfile();
      const cid      = profile?.company?.id ?? null;
      const jobsRes  = await recruiterService.listJobs({ companyId: cid, employmentType: 'freelance', limit: 200 });
      const biddable = (jobsRes.data ?? []).filter(j => ['public', 'both'].includes(j.jobMode));
      const perJob   = await Promise.all(
        biddable.map(j =>
          freelanceService.bidsByJob(j.id, { limit: 200 })
            .then(r => (r.data ?? []).map(b => ({
              ...b,
              jobTitle: b.jobTitle ?? j.title,
              jobEmploymentType: j.employmentType,
              jobLocation: j.location,
              jobSalaryMin: j.salaryMin,
              jobSalaryMax: j.salaryMax,
            })))
            .catch(() => [])
        )
      );
      // Only show pending bids — rejected ones are removed from the list.
      setBids(perJob.flat().filter(b => b.status === 'pending'));
    } catch {
      setError('Failed to load bids.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const reject = async (bidId) => {
    setBusy(bidId);
    try { await freelanceService.rejectBid(bidId); await load(); }
    catch (e) { setError(e?.response?.data?.message || 'Action failed.'); }
    finally { setBusy(null); }
  };

  const handleContractCreated = () => {
    setContractTarget(null);
    load();
  };

  const freelancerName = (b) =>
    b.freelancer ? `${b.freelancer.firstName} ${b.freelancer.lastName}` : `Freelancer #${b.freelancerId}`;

  return (
    <RecruiterLayout title="Bids Received">
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? <p className="text-sm text-gray-400">Loading…</p>
        : bids.length === 0 ? (
          <div className="bg-white border border-gray-200 text-center py-16 text-gray-400">
            <p className="text-lg">No pending bids</p>
            <p className="text-sm mt-1">Bids on your public freelance jobs will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bids.map(b => (
              <div key={b.id} className="bg-white border border-gray-200 px-5 py-4 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{freelancerName(b)}</h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{b.jobTitle}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    ${Number(b.price).toLocaleString()} · {b.deliveryTimeDays} days
                  </p>
                  {b.message && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{b.message}</p>}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    disabled={busy === b.id}
                    onClick={() => reject(b.id)}
                    className="px-3 py-1.5 border border-red-200 text-red-600 text-xs font-medium rounded hover:bg-red-50 disabled:opacity-50"
                  >
                    Rejected
                  </button>
                  <button
                    onClick={() => navigate('/chat')}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"
                  >
                    Live Chat
                  </button>
                  <button
                    onClick={() => setContractTarget(b)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
                  >
                    Make a Contract
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      {contractTarget && (
        <ContractModal
          source="bid"
          sourceId={contractTarget.id}
          personName={freelancerName(contractTarget)}
          defaultPrice={contractTarget.price}
          context={{
            job: {
              title: contractTarget.jobTitle,
              employmentType: contractTarget.jobEmploymentType,
              location: contractTarget.jobLocation,
              salaryMin: contractTarget.jobSalaryMin,
              salaryMax: contractTarget.jobSalaryMax,
            },
            bid: {
              price: contractTarget.price,
              deliveryDays: contractTarget.deliveryTimeDays,
              message: contractTarget.message,
            },
          }}
          onClose={() => setContractTarget(null)}
          onCreated={handleContractCreated}
        />
      )}
    </RecruiterLayout>
  );
}
