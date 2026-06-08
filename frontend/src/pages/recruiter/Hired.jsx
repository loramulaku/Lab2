import { useEffect, useState, useCallback } from 'react';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import freelanceService from '../../services/freelanceService';

/**
 * Hired page — shows all people who have an approved (active) contract.
 *
 * Standard  — source='pipeline'  (candidates hired through the pipeline)
 * Freelance — source='bid' | 'invitation'  (freelancers hired through bids/invitations)
 *
 * A person only appears here AFTER the contract has been approved (status='active').
 */
export default function Hired() {
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [activeTab, setActiveTab] = useState('standard'); // 'standard' | 'freelance'

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await freelanceService.hiredRecords({ limit: 200 });
      setRecords(res.data ?? []);
    } catch {
      setError('Failed to load hired records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const standard  = records.filter(c => c.source === 'pipeline');
  const freelance = records.filter(c => c.source === 'bid' || c.source === 'invitation');

  const fmt = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const fmtMoney = (val) => val != null ? `$${Number(val).toLocaleString()}` : '—';

  const personName = (c) =>
    c.freelancer
      ? `${c.freelancer.firstName ?? ''} ${c.freelancer.lastName ?? ''}`.trim() || '—'
      : '—';

  return (
    <RecruiterLayout title="Hired">
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* Tab nav */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { key: 'standard',  label: 'Standard',  count: standard.length },
          { key: 'freelance', label: 'Freelance',  count: freelance.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`ml-2 px-1.5 py-0.5 text-[11px] rounded-full ${
              activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : activeTab === 'standard' ? (
        <StandardSection records={standard} fmt={fmt} fmtMoney={fmtMoney} personName={personName} />
      ) : (
        <FreelanceSection records={freelance} fmt={fmt} fmtMoney={fmtMoney} personName={personName} />
      )}
    </RecruiterLayout>
  );
}

function StandardSection({ records, fmt, fmtMoney, personName }) {
  if (records.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl text-center py-16 text-gray-400">
        <p className="text-lg font-medium">No standard hires yet</p>
        <p className="text-sm mt-1">Candidates appear here after their employment contract is approved.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map(c => (
        <div key={c.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900">{personName(c)}</h3>
            </div>
            <p className="text-sm text-gray-500">{c.jobTitle ?? '—'}</p>
            <p className="text-xs text-gray-400 mt-1">{c.companyName ?? '—'}</p>
          </div>
          <div className="text-right flex-shrink-0 space-y-1">
            <p className="text-sm font-semibold text-gray-800">{fmtMoney(c.agreedPrice)}</p>
            <p className="text-xs text-gray-500">Start: {fmt(c.startDate)}</p>
            <p className="text-xs text-gray-400">Hired: {fmt(c.approvedAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FreelanceSection({ records, fmt, fmtMoney, personName }) {
  if (records.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl text-center py-16 text-gray-400">
        <p className="text-lg font-medium">No freelance hires yet</p>
        <p className="text-sm mt-1">Freelancers appear here after they approve their contract.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map(c => (
        <div key={c.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900">{personName(c)}</h3>
              {c.source && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                  {c.source === 'bid' ? 'via Bid' : 'via Invitation'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{c.jobTitle ?? '—'}</p>
            <p className="text-xs text-gray-400 mt-1">{c.companyName ?? '—'}</p>
          </div>
          <div className="text-right flex-shrink-0 space-y-1">
            <p className="text-sm font-semibold text-gray-800">{fmtMoney(c.agreedPrice)}</p>
            <p className="text-xs text-gray-500">
              {fmt(c.startDate)}{c.endDate ? ` → ${fmt(c.endDate)}` : ''}
            </p>
            <p className="text-xs text-gray-400">Hired: {fmt(c.approvedAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
