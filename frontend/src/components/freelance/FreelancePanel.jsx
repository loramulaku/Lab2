import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import freelanceService from '../../services/freelanceService';
import BidModal from './BidModal';

const SUB_TABS = ['Find Work', 'My Bids', 'Invitations', 'Contracts'];

const STATUS_CLS = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-teal-100 text-teal-700',
  accepted:  'bg-green-100 text-green-800',
  rejected:  'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
  expired:   'bg-gray-100 text-gray-500',
  revoked:   'bg-gray-100 text-gray-500',
  active:    'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
};
const Badge = ({ status }) => (
  <span className={`text-xs px-2 py-0.5 font-medium ${STATUS_CLS[status] ?? 'bg-gray-100 text-gray-600'}`}>{status}</span>
);

// ── Job Detail Modal ──────────────────────────────────────────────────────────
function JobDetailModal({ jobId, onClose }) {
  const [job, setJob]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    freelanceService.getJob(jobId)
      .then(setJob)
      .catch(() => setError('Could not load job details.'))
      .finally(() => setLoading(false));
  }, [jobId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            {loading ? 'Loading…' : (job?.title ?? 'Job Details')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 text-sm text-gray-700">
          {loading && <p className="text-gray-400">Loading…</p>}
          {error   && <p className="text-red-600">{error}</p>}
          {job && (
            <>
              {/* Meta row */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {job.employmentType && <span className="bg-gray-100 px-2 py-0.5">{job.employmentType}</span>}
                {job.workMode       && <span className="bg-gray-100 px-2 py-0.5">{job.workMode}</span>}
                {job.experienceLevel && <span className="bg-gray-100 px-2 py-0.5">{job.experienceLevel}</span>}
                {job.status && <Badge status={job.status} />}
              </div>

              {/* Budget */}
              {(job.budgetMin || job.budgetMax) && (
                <p className="text-gray-800">
                  <span className="font-medium">Budget:</span>{' '}
                  ${Number(job.budgetMin ?? 0).toLocaleString()} – ${Number(job.budgetMax ?? 0).toLocaleString()}
                </p>
              )}

              {/* Description */}
              {job.description && (
                <Section title="Description">{job.description}</Section>
              )}
              {job.responsibilities && (
                <Section title="Responsibilities">{job.responsibilities}</Section>
              )}
              {job.requirements && (
                <Section title="Requirements">{job.requirements}</Section>
              )}
              {job.niceToHave && (
                <Section title="Nice to have">{job.niceToHave}</Section>
              )}
              {job.benefits && (
                <Section title="Benefits">{job.benefits}</Section>
              )}
              {job.schedule && (
                <Section title="Schedule">{job.schedule}</Section>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="font-medium text-gray-900 mb-1">{title}</p>
      <p className="text-gray-600 leading-relaxed whitespace-pre-line">{children}</p>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function FreelancePanel() {
  const [searchParams] = useSearchParams();

  const subFromParams = useCallback(() => {
    const raw = searchParams.get('sub')?.toLowerCase();
    if (raw === 'invitations') return 'Invitations';
    if (raw === 'bids')        return 'My Bids';
    if (raw === 'contracts')   return 'Contracts';
    return null;
  }, [searchParams]);

  const [sub, setSub] = useState(subFromParams() ?? 'Find Work');

  // Sync sub-tab when searchParams change (e.g. user arrives via notification link)
  useEffect(() => {
    const target = subFromParams();
    if (target) setSub(target);
  }, [subFromParams]);

  const [jobs, setJobs]     = useState([]);
  const [bids, setBids]     = useState([]);
  const [invites, setInvites] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [bidJob, setBidJob] = useState(null);
  const [viewJobId, setViewJobId] = useState(null);     // job detail modal
  const [expandedBids, setExpandedBids] = useState({}); // bid detail expand state

  const toggleBid = (id) => setExpandedBids(prev => ({ ...prev, [id]: !prev[id] }));

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

  const handleBid      = async ({ price, deliveryTimeDays, message }) => {
    await freelanceService.submitBid(bidJob.id, { price, deliveryTimeDays, message });
    await loadAll();
  };
  const handleWithdraw = async (bidId) => { await freelanceService.withdrawBid(bidId); await loadAll(); };
  const handleConfirm  = async (id)    => { await freelanceService.confirmInvitation(id); await loadAll(); };
  const handleReject   = async (id)    => { await freelanceService.rejectInvitation(id); await loadAll(); };
  const handleApproveContract = async (id) => { await freelanceService.approveContract(id); await loadAll(); };

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
          {/* ── Find Work ── */}
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

          {/* ── My Bids ── */}
          {sub === 'My Bids' && (
            <div className="space-y-3">
              {bids.length === 0 ? <Empty msg="You haven't placed any bids yet." /> :
                bids.map(b => {
                  const isExpanded = !!expandedBids[b.id];
                  const milestones = Array.isArray(b.milestones) ? b.milestones : (b.milestones ? [b.milestones] : []);
                  const links = Array.isArray(b.portfolioLinks) ? b.portfolioLinks : (b.portfolioLinks ? [b.portfolioLinks] : []);
                  return (
                    <div key={b.id} className="border border-gray-200">
                      {/* Summary row */}
                      <div className="p-4 flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">{b.jobTitle ?? `Job #${b.jobId}`}</p>
                          <p className="text-sm text-gray-500">{b.companyName}</p>
                          <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                            {b.price != null && <span>${Number(b.price).toLocaleString()}</span>}
                            {b.deliveryTimeDays && <span>{b.deliveryTimeDays} days</span>}
                            {b.bidType && b.bidType !== 'fixed' && (
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5">{b.bidType}</span>
                            )}
                            {b.hoursPerWeek && <span>{b.hoursPerWeek}h/week</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge status={b.status} />
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleBid(b.id)}
                              className="text-xs text-indigo-600 hover:underline">
                              {isExpanded ? 'Hide details' : 'View details'}
                            </button>
                            {b.status === 'pending' &&
                              <button onClick={() => handleWithdraw(b.id)} className="text-xs text-red-600 hover:underline">Withdraw</button>}
                          </div>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 px-4 py-4 space-y-3 text-sm text-gray-700 bg-gray-50">
                          {b.message && (
                            <BidDetail label="Message">{b.message}</BidDetail>
                          )}
                          {b.coverLetter && (
                            <BidDetail label="Cover Letter">{b.coverLetter}</BidDetail>
                          )}
                          {b.startDate && (
                            <BidDetail label="Start Date">{b.startDate}</BidDetail>
                          )}
                          {milestones.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-800 mb-1">Milestones</p>
                              <ul className="list-disc list-inside space-y-1 text-gray-600">
                                {milestones.map((m, i) => (
                                  <li key={i}>{typeof m === 'object' ? (m.title ?? JSON.stringify(m)) : m}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {links.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-800 mb-1">Portfolio Links</p>
                              <ul className="space-y-1">
                                {links.map((l, i) => (
                                  <li key={i}>
                                    <a href={l} target="_blank" rel="noopener noreferrer"
                                      className="text-indigo-600 hover:underline break-all text-xs">{l}</a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* ── Invitations ── */}
          {sub === 'Invitations' && (
            <div className="space-y-3">
              {invites.length === 0 ? <Empty msg="No invitations received yet." /> :
                invites.map(inv => (
                  <div key={inv.id} className="border border-gray-200 p-4">
                    <div className="flex justify-between items-start gap-4">
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
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge status={inv.status} />
                        {inv.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleConfirm(inv.id)} className="px-3 py-1.5 bg-teal-600 text-white text-xs font-medium hover:bg-teal-700">Confirm</button>
                            <button onClick={() => handleReject(inv.id)} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50">Decline</button>
                          </div>
                        )}
                        {inv.status === 'confirmed' && (
                          <p className="text-xs text-teal-600 font-medium">Awaiting recruiter</p>
                        )}
                      </div>
                    </div>
                    {inv.jobId && (
                      <button
                        onClick={() => setViewJobId(inv.jobId)}
                        className="mt-2 text-xs text-indigo-600 hover:underline">
                        View job details →
                      </button>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* ── Contracts ── */}
          {sub === 'Contracts' && (
            <div className="space-y-3">
              {contracts.length === 0 ? <Empty msg="No contracts yet. Accept an invitation or win a bid to start one." /> :
                contracts.map(c => (
                  <div key={c.id} className="border border-gray-200 p-4 flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{c.jobTitle ?? `Job #${c.jobId}`}</p>
                      <p className="text-sm text-gray-500">{c.companyName} · via {c.source}</p>
                      <p className="text-sm text-gray-600 mt-1">${Number(c.agreedPrice ?? 0).toLocaleString()}</p>
                      {c.startDate && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Start: {c.startDate}{c.endDate ? ` → ${c.endDate}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge status={c.status} />
                      {c.status === 'pending' && (
                        <button
                          onClick={() => handleApproveContract(c.id)}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium hover:bg-green-700 rounded transition-colors"
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}

      {bidJob    && <BidModal job={bidJob} onSubmit={handleBid} onClose={() => setBidJob(null)} />}
      {viewJobId && <JobDetailModal jobId={viewJobId} onClose={() => setViewJobId(null)} />}
    </div>
  );
}

const Empty = ({ msg }) => (
  <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200">{msg}</div>
);

const BidDetail = ({ label, children }) => (
  <div>
    <p className="font-medium text-gray-800 mb-0.5">{label}</p>
    <p className="text-gray-600 leading-relaxed whitespace-pre-line">{children}</p>
  </div>
);
