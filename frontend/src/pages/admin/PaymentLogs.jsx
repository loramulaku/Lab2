import { useEffect, useState } from 'react';
import { AdminPage, PageCard } from '../../components/layout';
import { adminApi } from '../../services/adminApi';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const fmtAmount = (amount, currency = 'usd') =>
  amount != null
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(Number(amount))
    : '—';

const StatusPill = ({ status }) => {
  const styles = {
    succeeded: 'bg-green-100 text-green-700',
    failed:    'bg-red-100 text-red-700',
    pending:   'bg-yellow-100 text-yellow-700',
    refunded:  'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status ?? '—'}
    </span>
  );
};

export default function PaymentLogs() {
  const [payments, setPayments]     = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [page, setPage]             = useState(1);

  const load = async (pg = 1, status = '') => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: pg, limit: 25 });
      if (status) params.set('status', status);
      const data = await adminApi.get(`/admin/payment-logs?${params}`).then(r => r.data);
      setPayments(data.payments ?? []);
      setPagination(data.pagination ?? { total: 0, page: pg, pages: 1 });
    } catch {
      setError('Failed to load payment logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page, statusFilter); }, [page, statusFilter]);

  const totalSucceeded = payments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <AdminPage title="Payment Logs">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total records', value: pagination.total },
          { label: 'Succeeded (this page)',  value: payments.filter(p => p.status === 'succeeded').length },
          { label: 'Failed (this page)',     value: payments.filter(p => p.status === 'failed').length },
          { label: 'Revenue (this page)',    value: fmtAmount(totalSucceeded) },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-lg font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
        >
          <option value="">All statuses</option>
          <option value="succeeded">Succeeded</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : payments.length === 0 ? (
        <PageCard>
          <p className="text-center py-10 text-gray-500 text-sm">No payment records found.</p>
        </PageCard>
      ) : (
        <PageCard className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="px-5 py-3 font-medium text-gray-500">Date</th>
                <th className="px-5 py-3 font-medium text-gray-500">Company</th>
                <th className="px-5 py-3 font-medium text-gray-500">Plan</th>
                <th className="px-5 py-3 font-medium text-gray-500">Amount</th>
                <th className="px-5 py-3 font-medium text-gray-500">Method</th>
                <th className="px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 font-medium text-gray-500">Gateway ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{fmtDate(p.createdAt)}</td>
                  <td className="px-5 py-3 text-gray-900 font-medium">{p.companyName ?? `#${p.companyId}`}</td>
                  <td className="px-5 py-3 text-gray-700">{p.planName ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-900 font-semibold whitespace-nowrap">{fmtAmount(p.amount, p.currency)}</td>
                  <td className="px-5 py-3 text-gray-600 capitalize">{p.paymentMethod ?? '—'}</td>
                  <td className="px-5 py-3"><StatusPill status={p.status} /></td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-400 truncate max-w-[140px]">{p.stripePaymentIntentId ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Page {pagination.page} of {pagination.pages} ({pagination.total} total)</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                  className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                  Previous
                </button>
                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
                  className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </PageCard>
      )}
    </AdminPage>
  );
}
