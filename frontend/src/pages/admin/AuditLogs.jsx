import { useState, useEffect, useCallback } from 'react';
import { AdminPage } from '../../components/layout';
import api from '../../services/api';

const ENTITY_OPTIONS = ['All', 'User', 'Job', 'Bid', 'Invitation'];

function fmt(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}

export default function AuditLogs() {
  const [logs,       setLogs]       = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  // Filter state
  const [actionQ,  setActionQ]  = useState('');
  const [entityQ,  setEntityQ]  = useState('All');
  const [fromQ,    setFromQ]    = useState('');
  const [toQ,      setToQ]      = useState('');
  const [applied,  setApplied]  = useState({ action: '', entity: 'All', from: '', to: '' });

  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (applied.action) params.set('action', applied.action);
      if (applied.entity && applied.entity !== 'All') params.set('entity', applied.entity);
      if (applied.from)   params.set('from', applied.from);
      if (applied.to)     params.set('to',   applied.to);

      const { data } = await api.get(`/admin/audit-logs?${params}`);
      setLogs(data.logs ?? []);
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch {
      setError('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [page, applied]);

  useEffect(() => { load(); }, [load]);

  function applyFilters() {
    setPage(1);
    setApplied({ action: actionQ, entity: entityQ, from: fromQ, to: toQ });
  }

  function clearFilters() {
    setActionQ(''); setEntityQ('All'); setFromQ(''); setToQ('');
    setPage(1);
    setApplied({ action: '', entity: 'All', from: '', to: '' });
  }

  const hasFilter = applied.action || applied.entity !== 'All' || applied.from || applied.to;

  return (
    <AdminPage title="Audit Logs" subtitle={`${total} total event${total !== 1 ? 's' : ''}`} loading={false} error={error}>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="page-shell-card rounded-xl p-4 mb-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Action</label>
          <input
            type="text"
            value={actionQ}
            onChange={e => setActionQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
            placeholder="e.g. USER_LOGIN"
            className="border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Entity</label>
          <select
            value={entityQ}
            onChange={e => setEntityQ(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {ENTITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">From</label>
          <input
            type="date"
            value={fromQ}
            onChange={e => setFromQ(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">To</label>
          <input
            type="date"
            value={toQ}
            onChange={e => setToQ(e.target.value)}
            className="border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Filter
          </button>
          {hasFilter && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 border border-gray-300 text-gray-600 text-sm hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : logs.length === 0 ? (
        <div className="page-shell-card rounded-xl text-center py-16 text-gray-400">
          <p className="text-lg">No audit events found</p>
          {hasFilter && (
            <button onClick={clearFilters} className="mt-3 text-sm text-blue-600 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="page-shell-card rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {['Date', 'User ID', 'Action', 'Entity', 'Entity ID', 'IP Address'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr
                    key={log.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{fmt(log.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-gray-700">{log.userId ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{log.entity}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-gray-500">{log.entityId ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-gray-400 text-xs">{log.ipAddress ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ─────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages} ({total} events)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </AdminPage>
  );
}
