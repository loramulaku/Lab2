import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import StatusBadge from '../../components/recruiter/StatusBadge';
import ContractModal from '../../components/recruiter/ContractModal';
import recruiterService from '../../services/recruiterService';
import freelanceService from '../../services/freelanceService';
import api from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';

const PAGE_SIZE = 30;

const lc = (s) => (s ?? '').toLowerCase();

function fmt(n) {
  return n != null ? `$${Number(n).toLocaleString()}` : '—';
}

export default function BidsReceived() {
  const navigate  = useNavigate();
  const [bids,       setBids]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [busy,       setBusy]       = useState(null);
  const [chatBusy,   setChatBusy]   = useState(null);
  const [selected,   setSelected]   = useState(null); // currently open bid
  const [contractTarget, setContractTarget] = useState(null);
  const [page, setPage] = useState(1);

  const [nameQ,  setNameQ]  = useState('');
  const [titleQ, setTitleQ] = useState('');

  const debouncedName  = useDebounce(nameQ,  300);
  const debouncedTitle = useDebounce(titleQ, 300);

  const visible = useMemo(() => bids.filter(b => {
    const name = b.freelancer
      ? `${lc(b.freelancer.firstName)} ${lc(b.freelancer.lastName)}`
      : lc(`freelancer #${b.freelancerId}`);
    if (debouncedName  && !name.includes(lc(debouncedName)))            return false;
    if (debouncedTitle && !lc(b.jobTitle).includes(lc(debouncedTitle))) return false;
    return true;
  }), [bids, debouncedName, debouncedTitle]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = useMemo(
    () => visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [visible, safePage]
  );

  useEffect(() => { setPage(1); }, [debouncedName, debouncedTitle]);

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
              jobTitle:          b.jobTitle          ?? j.title,
              jobDescription:    j.description       ?? '',
              jobEmploymentType: j.employmentType,
              jobWorkMode:       j.workMode,
              jobLocation:       j.location,
              jobBudgetMin:      j.budgetMin,
              jobBudgetMax:      j.budgetMax,
            })))
            .catch(() => [])
        )
      );
      const flat = perJob.flat().filter(b => b.status === 'pending');
      setBids(flat);
      // Reselect to get updated data when reloading
      setSelected(prev => prev ? (flat.find(b => b.id === prev.id) ?? null) : null);
    } catch {
      setError('Failed to load bids.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const reject = useCallback(async (bidId) => {
    setBusy(bidId);
    try { await freelanceService.rejectBid(bidId); await load(); }
    catch (e) { setError(e?.response?.data?.message || 'Action failed.'); }
    finally { setBusy(null); }
  }, [load]);

  const openChat = useCallback(async (b) => {
    setChatBusy(b.id);
    try {
      const { data } = await api.post('/conversations', { recipientId: b.freelancerId });
      navigate('/chat', { state: { conversationId: data.id } });
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not open chat.');
      setChatBusy(null);
    }
  }, [navigate]);

  const handleContractCreated = useCallback(() => {
    setContractTarget(null);
    load();
  }, [load]);

  const freelancerName = (b) =>
    b.freelancer ? `${b.freelancer.firstName} ${b.freelancer.lastName}` : `Freelancer #${b.freelancerId}`;

  return (
    <RecruiterLayout title="Bids Received">
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : bids.length === 0 ? (
        <div className="page-shell-card rounded-xl text-center py-16 text-gray-400">
          <p className="text-lg">No bids yet</p>
          <p className="text-sm mt-1">Bids on your public freelance jobs will appear here.</p>
        </div>
      ) : (
        <div className="flex gap-4 min-h-[70vh] items-start">

          {/* ── Left: bid list ── */}
          <div className="w-72 flex-shrink-0 space-y-2">
            {/* Search filters */}
            <div className="space-y-2 mb-3">
              <input
                type="text" value={nameQ} onChange={e => setNameQ(e.target.value)}
                placeholder="Freelancer name…"
                className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text" value={titleQ} onChange={e => setTitleQ(e.target.value)}
                placeholder="Job title…"
                className="w-full border border-gray-300 px-3 py-2 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {visible.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No results match your search.</p>
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-1">
                  {visible.length} bid{visible.length !== 1 ? 's' : ''}
                  {totalPages > 1 && ` · page ${safePage}/${totalPages}`}
                </p>
                {pageItems.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelected(b)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      selected?.id === b.id
                        ? 'border-blue-400 bg-blue-50/60 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {(b.freelancer?.firstName?.[0] ?? '?').toUpperCase()}
                        {(b.freelancer?.lastName?.[0] ?? '').toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{freelancerName(b)}</p>
                        <p className="text-xs text-gray-500 truncate">{b.jobTitle}</p>
                        <p className="text-xs text-gray-700 mt-0.5 font-medium">
                          {fmt(b.price)}
                          {b.deliveryTimeDays ? ` · ${b.deliveryTimeDays}d` : ''}
                        </p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  </button>
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40">← Prev</button>
                    <span className="text-xs text-gray-500">{safePage} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Right: detail panel ── */}
          <div className="flex-1 min-w-0">
            {!selected ? (
              <div className="page-shell-card rounded-xl flex items-center justify-center h-64 text-gray-400">
                <p className="text-sm">Select a bid from the list to view details</p>
              </div>
            ) : (
              <div className="page-shell-card rounded-xl p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{freelancerName(selected)}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Applied to: <span className="font-medium text-gray-700">{selected.jobTitle}</span></p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ── Job Details ── */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Job Details</h3>
                    <div className="space-y-2 text-sm">
                      <DetailRow label="Title">{selected.jobTitle ?? '—'}</DetailRow>
                      {selected.jobEmploymentType && <DetailRow label="Type">{selected.jobEmploymentType}</DetailRow>}
                      {selected.jobWorkMode      && <DetailRow label="Mode">{selected.jobWorkMode}</DetailRow>}
                      {selected.jobLocation      && <DetailRow label="Location">{selected.jobLocation}</DetailRow>}
                      {(selected.jobBudgetMin != null || selected.jobBudgetMax != null) && (
                        <DetailRow label="Budget">
                          {fmt(selected.jobBudgetMin)} – {fmt(selected.jobBudgetMax)}
                        </DetailRow>
                      )}
                      {selected.jobDescription && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-gray-500 mb-1">Description</p>
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-6 whitespace-pre-line">{selected.jobDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Freelancer Bid ── */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bid Details</h3>
                    <div className="space-y-2 text-sm">
                      <DetailRow label="Price">{fmt(selected.price)}</DetailRow>
                      {selected.deliveryTimeDays && <DetailRow label="Delivery">{selected.deliveryTimeDays} days</DetailRow>}
                      {selected.bidType && selected.bidType !== 'fixed' && (
                        <DetailRow label="Bid type">{selected.bidType}</DetailRow>
                      )}
                      {selected.hoursPerWeek && <DetailRow label="Hours/week">{selected.hoursPerWeek}</DetailRow>}
                      {selected.startDate && <DetailRow label="Start date">{selected.startDate}</DetailRow>}
                    </div>

                    {selected.message && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Message</p>
                        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{selected.message}</p>
                      </div>
                    )}
                    {selected.coverLetter && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Cover Letter</p>
                        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{selected.coverLetter}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Actions ── */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    disabled={busy === selected.id}
                    onClick={() => reject(selected.id)}
                    className="px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    Reject Bid
                  </button>
                  <button
                    disabled={chatBusy === selected.id}
                    onClick={() => openChat(selected)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {chatBusy === selected.id ? '…' : 'Live Chat'}
                  </button>
                  <button
                    onClick={() => setContractTarget(selected)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Make a Contract
                  </button>
                </div>
              </div>
            )}
          </div>
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
              title:          contractTarget.jobTitle,
              employmentType: contractTarget.jobEmploymentType,
              location:       contractTarget.jobLocation,
              salaryMin:      contractTarget.jobBudgetMin,
              salaryMax:      contractTarget.jobBudgetMax,
            },
            bid: {
              price:        contractTarget.price,
              deliveryDays: contractTarget.deliveryTimeDays,
              message:      contractTarget.message,
            },
          }}
          onClose={() => setContractTarget(null)}
          onCreated={handleContractCreated}
        />
      )}
    </RecruiterLayout>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-20 flex-shrink-0 text-xs text-gray-400 font-medium pt-0.5">{label}</span>
      <span className="text-gray-800 text-sm">{children}</span>
    </div>
  );
}
