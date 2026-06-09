import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RecruiterLayout from '../../../components/recruiter/RecruiterLayout';
import { subscriptionService } from '../../../services/subscriptionService';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const fmtAmount = (amount, currency = 'usd') => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(Number(amount));
};

const StatusPill = ({ status }) => {
  const styles = {
    succeeded: 'bg-green-100 text-green-700',
    failed:    'bg-red-100 text-red-700',
    pending:   'bg-yellow-100 text-yellow-700',
    refunded:  'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await subscriptionService.getMyInvoices();
        setInvoices(data ?? []);
      } catch {
        setError('Failed to load invoice history.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <RecruiterLayout title="Invoices & Billing">
      <p className="text-sm text-gray-500 mb-6">
        Your complete payment history.{' '}
        <Link to="/recruiter/billing/plan" className="text-blue-600 hover:underline">
          Manage your plan →
        </Link>
      </p>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : invoices.length === 0 ? (
        <div className="page-shell-card rounded-xl p-8 text-center text-gray-500">
          No payment records yet.{' '}
          <Link to="/recruiter/billing/upgrade" className="text-blue-600 hover:underline">
            Choose a plan
          </Link>{' '}
          to get started.
        </div>
      ) : (
        <div className="page-shell-card rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="px-5 py-3 font-medium text-gray-500">Date</th>
                <th className="px-5 py-3 font-medium text-gray-500">Plan</th>
                <th className="px-5 py-3 font-medium text-gray-500">Amount</th>
                <th className="px-5 py-3 font-medium text-gray-500">Method</th>
                <th className="px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 font-medium text-gray-500">Gateway ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-700 whitespace-nowrap">{fmtDate(inv.createdAt)}</td>
                  <td className="px-5 py-4 text-gray-900 font-medium">{inv.planName ?? '—'}</td>
                  <td className="px-5 py-4 text-gray-900 font-semibold whitespace-nowrap">
                    {fmtAmount(inv.amount, inv.currency)}
                  </td>
                  <td className="px-5 py-4 text-gray-600 capitalize">{inv.paymentMethod ?? '—'}</td>
                  <td className="px-5 py-4"><StatusPill status={inv.status} /></td>
                  <td className="px-5 py-4 text-gray-400 font-mono text-xs truncate max-w-[160px]">
                    {inv.stripePaymentIntentId ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </RecruiterLayout>
  );
}
