import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import StatusBadge from '../../components/recruiter/StatusBadge';
import recruiterService from '../../services/recruiterService';
import freelanceService from '../../services/freelanceService';

/**
 * Invited Freelancers — direct invitations sent on the recruiter's freelance
 * jobs (Mode B). Accepted invitations have produced a contract; pending ones
 * can be revoked.
 */
export default function InvitedFreelancers() {
  const navigate = useNavigate();
  const [invites, setInvites] = useState([]);
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
      const invitable = (jobsRes.data ?? []).filter(j => ['invite', 'both'].includes(j.jobMode));
      const perJob = await Promise.all(
        invitable.map(j => freelanceService.invitationsByJob(j.id, { limit: 200 })
          .then(r => (r.data ?? []).map(i => ({ ...i, jobTitle: i.title ?? j.title })))
          .catch(() => []))
      );
      setInvites(perJob.flat());
    } catch {
      setError('Failed to load invitations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const revoke = async (id) => {
    setBusy(id);
    try { await freelanceService.revokeInvitation(id); await load(); }
    catch (e) { setError(e?.response?.data?.message || 'Action failed.'); }
    finally { setBusy(null); }
  };

  return (
    <RecruiterLayout title="Invited Freelancers">
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? <p className="text-sm text-gray-400">Loading…</p>
        : invites.length === 0 ? (
          <div className="bg-white border border-gray-200 text-center py-16 text-gray-400">
            <p className="text-lg">No invitations sent yet</p>
            <p className="text-sm mt-1">Use “Active Freelancers” to search and invite freelancers.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invites.map(inv => (
              <div key={inv.id} className="bg-white border border-gray-200 px-5 py-4 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {inv.freelancer ? `${inv.freelancer.firstName} ${inv.freelancer.lastName}` : `Freelancer #${inv.freelancerId}`}
                    </h3>
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
                <div className="flex flex-col items-end gap-2">
                  {inv.status === 'pending' && (
                    <button disabled={busy === inv.id} onClick={() => revoke(inv.id)}
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50 disabled:opacity-50">Revoke</button>
                  )}
                  {inv.status === 'accepted' && (
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
