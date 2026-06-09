import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import StatusBadge from '../../components/recruiter/StatusBadge';
import ContractModal from '../../components/recruiter/ContractModal';
import recruiterService from '../../services/recruiterService';
import freelanceService from '../../services/freelanceService';
import api from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: '',           label: 'All Statuses' },
  { value: 'pending',    label: 'Pending' },
  { value: 'accepted',   label: 'Accepted' },
  { value: 'rejected',   label: 'Rejected' },
  { value: 'withdrawn',  label: 'Withdrawn' },
];

const lc = (s) => (s ?? '').toLowerCase();

export default function BidsReceived() {
  const navigate  = useNavigate();
  const [bids,    setBids]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [busy,     setBusy]     = useState(null);
  const [chatBusy, setChatBusy] = useState(null);
  const [contractTarget, setContractTarget] = useState(null);
  const [page, setPage] = useState(1);

  const [nameQ,   setNameQ]   = useState('');
  const [titleQ,  setTitleQ]  = useState('');
  const [statusQ, setStatusQ] = useState('');

  const debouncedName  = useDebounce(nameQ,  300);
  const debouncedTitle = useDebounce(titleQ, 300);

  const visible = useMemo(() => bids.filter(b => {
    const name = b.freelancer
      ? `${lc(b.freelancer.firstName)} ${lc(b.freelancer.lastName)}`
      : lc(`freelancer #${b.freelancerId}`);
    if (debouncedName  && !name.includes(lc(debouncedName)))              return false;
    if (debouncedTitle && !lc(b.jobTitle).includes(lc(debouncedTitle)))   return false;
    if (statusQ        && b.status !== statusQ)                           return false;
    return true;
  }), [bids, debouncedName, debouncedTitle, statusQ]);

  const hasFilter = nameQ || titleQ || statusQ;

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = useMemo(
    () => visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [visible, safePage]
  );

  useEffect(() => { setPage(1); }, [debouncedName, debouncedTitle, statusQ]);

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
      setBids(perJob.flat().filter(b => b.status === 'pending'));
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

      <div className="page-shell-card rounded-xl p-4 mb-6 grid md:grid-cols-3 gap-3">
        <input
          type="text"
          value={nameQ}
          onChange={e => setNameQ(e.target.value)}
          placeholder="Freelancer name…"
          className="border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={titleQ}
          onChange={e => setTitleQ(e.target.value)}
          placeholder="Job title…"
          className="border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusQ}
          onChange={e => setStatusQ(e.target.value)}
          className="border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : bids.length === 0 ? (
        <div className="page-shell-card rounded-xl text-center py-16 text-gray-400">
          <p className="text-lg">No bids yet</p>
          <p className="text-sm mt-1">Bids on your public freelance jobs will appear here.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="page-shell-card rounded-xl text-center py-10 text-gray-400">
          <p className="text-base">No results match your search</p>
          {hasFilter && (
            <button
              onClick={() => { setNameQ(''); setTitleQ(''); setStatusQ(''); }}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3">
            {visible.length} of {bids.length} bid{bids.length !== 1 ? 's' : ''}
            {totalPages > 1 && ` · page ${safePage} of ${totalPages}`}
          </p>
          <div className="space-y-3">
            {pageItems.map(b => (
              <div key={b.id} className="page-shell-card rounded-xl px-5 py-4 flex justify-between items-start gap-4">
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
                    disabled={chatBusy === b.id}
                    onClick={() => openChat(b)}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    {chatBusy === b.id ? '…' : 'Live Chat'}
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-500">{safePage} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
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
