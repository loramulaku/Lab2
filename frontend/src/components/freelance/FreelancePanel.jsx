import { useEffect, useState } from 'react';
import freelanceService from '../../services/freelanceService';
import BidModal from './BidModal';

/**
 * Candidate freelance workspace — appears on the profile once Freelance Mode
 * is active. Lets the candidate browse public freelance jobs and submit bids
 * (Mode A), and respond to direct invitations (Mode B), plus see their
 * resulting contracts.
 */
const SUB_TABS = ['Find Work', 'My Bids', 'Invitations', 'Contracts'];

const STATUS_CLS = {
  pending:  'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
  withdrawn:'bg-gray-100 text-gray-500',
  expired:  'bg-gray-100 text-gray-500',
  active:   'bg-green-100 text-green-800',
  completed:'bg-blue-100 text-blue-800',
};
const Badge = ({ status }) => (
  <span className={`text-xs px-2 py-0.5 font-medium ${STATUS_CLS[status] ?? 'bg-gray-100 text-gray-600'}`}>{status}</span>
);

export default function FreelancePanel() {
  const [sub, setSub]       = useState('Find Work');
  const [jobs, setJobs]     = useState([]);
  const [bids, setBids]     = useState([]);
  const [invites, setInvites] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [bidJob, setBidJob] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [jobsRes, bidsRes, invRes, conRes] = await Promise.all([
        freelanceService.listJobs({ employmentType: 'freelance', status: 'open', limit: 50 }),
        freelanceService.myBids({ limit: 50 }),
        freelanceService.myInvitations({ limit: 50 }),
        freelanceService.myContracts({ limit: 50 }),
      ]);
      // Only jobs that actually accept bids (public / both).
      setJobs((jobsRes.data ?? []).filter(j => ['public', 'both'].includes(j.jobMode)));
      setBids(bidsRes.data ?? []);
      setInvites(invRes.data ?? []);
      setContracts(conRes.data ?? []);
    } catch {
      setError('Failed to load freelance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const alreadyBidJobIds = new Set(bids.filter(b => b.status === 'pending' || b.status === 'accepted').map(b => b.jobId));

  const handleBid = async ({ price, deliveryTimeDays, message }) => {
    await freelanceService.submitBid(bidJob.id, { price, deliveryTimeDays, message });
    await loadAll();
  };
  const handleWithdraw = async (bidId) => { await freelanceService.withdrawBid(bidId); await loadAll(); };
  const handleAccept   = async (id)    => { await freelanceService.acceptInvitation(id); await loadAll(); setSub('Contracts'); };
  const handleReject   = async (id)    => { await freelanceService.rejectInvitation(id); await loadAll(); };

  return (
    <div>
      <div className="flex gap-1 border-b border-gray-200 mb-4">
        {SUB_TABS.map(t => (
          <button key={t} onClick={() => setSub(t)}
            className={`px-3 py-2 text-sm font-medium -mb-px border-b-2 transition ${
              sub === t ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t}
            {t === 'Invitations' && invites.filter(i => i.status === 'pending').length > 0 &&
              <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
                {invites.filter(i => i.status === 'pending').length}
              </span>}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {loading ? <p className="text-sm text-gray-400">Loading…</p> : (
        <>
          {sub === 'Find Work' && (
            <div className="space-y-3">
              {jobs.length === 0 ? <Empty msg="No open freelance jobs accepting bids right now." /> :
                jobs.map(job => (
                  <div key={job.id} className="border border-gray-200 p-4 flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.company?.name ?? 'Company'} · {job.workMode}</p>
                      {(job.budgetMin || job.budgetMax) && (
                        <p className="text-sm text-gray-600 mt-1">
                          Budget: ${Number(job.budgetMin ?? 0).toLocaleString()} – ${Number(job.budgetMax ?? 0).toLocaleString()}
                        </p>
                      )}
                      {job.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{job.description}</p>}
                    </div>
                    {alreadyBidJobIds.has(job.id)
                      ? <span className="text-xs text-gray-400 whitespace-nowrap">Bid submitted</span>
                      : <button onClick={() => setBidJob(job)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 whitespace-nowrap">
                          Submit Bid
                        </button>}
                  </div>
                ))}
            </div>
          )}

          {sub === 'My Bids' && (
            <div className="space-y-3">
              {bids.length === 0 ? <Empty msg="You haven't placed any bids yet." /> :
                bids.map(b => (
                  <div key={b.id} className="border border-gray-200 p-4 flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{b.jobTitle ?? `Job #${b.jobId}`}</p>
                      <p className="text-sm text-gray-500">{b.companyName}</p>
                      <p className="text-sm text-gray-600 mt-1">${Number(b.price).toLocaleString()} · {b.deliveryTimeDays} days</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge status={b.status} />
                      {b.status === 'pending' &&
                        <button onClick={() => handleWithdraw(b.id)} className="text-xs text-red-600 hover:underline">Withdraw</button>}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {sub === 'Invitations' && (
            <div className="space-y-3">
              {invites.length === 0 ? <Empty msg="No invitations received yet." /> :
                invites.map(inv => (
                  <div key={inv.id} className="border border-gray-200 p-4 flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{inv.title ?? inv.jobTitle ?? `Invitation #${inv.id}`}</p>
                      <p className="text-sm text-gray-500">{inv.companyName}</p>
                      {(inv.priceOffer || inv.deliveryTimeDays) && (
                        <p className="text-sm text-gray-600 mt-1">
                          {inv.priceOffer ? `$${Number(inv.priceOffer).toLocaleString()}` : ''}
                          {inv.deliveryTimeDays ? ` · ${inv.deliveryTimeDays} days` : ''}
                        </p>
                      )}
                      {inv.message && <p className="text-sm text-gray-500 mt-1">{inv.message}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge status={inv.status} />
                      {inv.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleAccept(inv.id)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium hover:bg-green-700">Accept</button>
                          <button onClick={() => handleReject(inv.id)} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50">Decline</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {sub === 'Contracts' && (
            <div className="space-y-3">
              {contracts.length === 0 ? <Empty msg="No contracts yet. Accept an invitation or win a bid to start one." /> :
                contracts.map(c => (
                  <div key={c.id} className="border border-gray-200 p-4 flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{c.jobTitle ?? `Job #${c.jobId}`}</p>
                      <p className="text-sm text-gray-500">{c.companyName} · via {c.source}</p>
                      <p className="text-sm text-gray-600 mt-1">${Number(c.agreedPrice ?? 0).toLocaleString()}</p>
                    </div>
                    <Badge status={c.status} />
                  </div>
                ))}
            </div>
          )}
        </>
      )}

      {bidJob && <BidModal job={bidJob} onSubmit={handleBid} onClose={() => setBidJob(null)} />}
    </div>
  );
}

const Empty = ({ msg }) => (
  <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200">{msg}</div>
);
