import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import StatusBadge from '../../components/recruiter/StatusBadge';
import ContractModal from '../../components/recruiter/ContractModal';
import recruiterService from '../../services/recruiterService';
import freelanceService from '../../services/freelanceService';
import api from '../../services/api';

const PAGE_SIZE = 20;

/**
 * Invited Freelancers — direct invitations sent by the recruiter (Mode B).
 * Buttons per row: Rejected (revoke) · Live Chat · Make a Contract
 */
export default function InvitedFreelancers() {
  const navigate  = useNavigate();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [busy,     setBusy]     = useState(null);
  const [chatBusy, setChatBusy] = useState(null);
  const [contractTarget, setContractTarget] = useState(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(invites.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = useMemo(
    () => invites.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [invites, safePage]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profile   = await recruiterService.getProfile();
      const cid       = profile?.company?.id ?? null;
      const jobsRes   = await recruiterService.listJobs({ companyId: cid, employmentType: 'freelance', limit: 200 });
      const invitable = (jobsRes.data ?? []).filter(j => ['invite', 'both'].includes(j.jobMode));
      const perJob    = await Promise.all(
        invitable.map(j =>
          freelanceService.invitationsByJob(j.id, { limit: 200 })
            .then(r => (r.data ?? []).map(i => ({
              ...i,
              jobTitle: i.title ?? j.title,
              jobEmploymentType: j.employmentType,
              jobLocation: j.location,
              jobSalaryMin: j.salaryMin,
              jobSalaryMax: j.salaryMax,
            })))
            .catch(() => [])
        )
      );
      // Show pending (awaiting freelancer) and confirmed (freelancer confirmed, recruiter can act).
      setInvites(perJob.flat().filter(i => ['pending', 'confirmed'].includes(i.status)));
    } catch {
      setError('Failed to load invitations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const reject = async (id) => {
    setBusy(id);
    try { await freelanceService.revokeInvitation(id); await load(); }
    catch (e) { setError(e?.response?.data?.message || 'Action failed.'); }
    finally { setBusy(null); }
  };

  const openChat = async (inv) => {
    setChatBusy(inv.id);
    try {
      const { data } = await api.post('/conversations', { recipientId: inv.freelancerId });
      navigate('/chat', { state: { conversationId: data.id } });
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not open chat.');
      setChatBusy(null);
    }
  };

  const handleContractCreated = () => {
    setContractTarget(null);
    load();
  };

  const freelancerName = (inv) =>
    inv.freelancer
      ? `${inv.freelancer.firstName} ${inv.freelancer.lastName}`
      : `Freelancer #${inv.freelancerId}`;

  return (
    <RecruiterLayout title="Invited Freelancers">
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? <p className="text-sm text-gray-400">Loading…</p>
        : invites.length === 0 ? (
          <div className="page-shell-card rounded-xl text-center py-16 text-gray-400">
            <p className="text-lg">No active invitations</p>
            <p className="text-sm mt-1">Go to "Active Freelancers" to search and invite freelancers.</p>
          </div>
        ) : (
          <>
          <p className="text-xs text-gray-400 mb-3">
            {invites.length} invitation{invites.length !== 1 ? 's' : ''}
            {totalPages > 1 && ` · page ${safePage} of ${totalPages}`}
          </p>
          <div className="space-y-3">
            {pageItems.map(inv => (
              <div key={inv.id} className="page-shell-card rounded-xl px-5 py-4 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{freelancerName(inv)}</h3>
                    <StatusBadge status={inv.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{inv.jobTitle}</p>
                  {(inv.priceOffer || inv.deliveryTimeDays) && (
                    <p className="text-sm text-gray-700 mt-1">
                      {inv.priceOffer ? `$${Number(inv.priceOffer).toLocaleString()}` : ''}
                      {inv.deliveryTimeDays ? ` · ${inv.deliveryTimeDays} days` : ''}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {inv.status === 'confirmed' ? (
                    <>
                      <button
                        disabled={busy === inv.id}
                        onClick={() => reject(inv.id)}
                        className="px-3 py-1.5 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        Rejected
                      </button>
                      <button
                        disabled={chatBusy === inv.id}
                        onClick={() => openChat(inv)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        {chatBusy === inv.id ? '…' : 'Live Chat'}
                      </button>
                      <button
                        onClick={() => setContractTarget(inv)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                      >
                        Make a Contract
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Awaiting confirmation</span>
                  )}
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

      {contractTarget && (
        <ContractModal
          source="invitation"
          sourceId={contractTarget.id}
          personName={freelancerName(contractTarget)}
          defaultPrice={contractTarget.priceOffer ?? ''}
          context={{
            job: {
              title: contractTarget.jobTitle,
              employmentType: contractTarget.jobEmploymentType,
              location: contractTarget.jobLocation,
              salaryMin: contractTarget.jobSalaryMin,
              salaryMax: contractTarget.jobSalaryMax,
            },
            invitation: {
              priceOffer: contractTarget.priceOffer,
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
