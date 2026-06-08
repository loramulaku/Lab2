import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RecruiterLayout from '../../../components/recruiter/RecruiterLayout';
import { subscriptionService } from '../../../services/subscriptionService';

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  : '—';

const fmtPrice = (price, interval) => {
  if (price == null) return '—';
  return `$${Number(price).toLocaleString()} / ${interval ?? 'month'}`;
};

export default function Invoices() {
  const [sub, setSub] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setSub(await subscriptionService.getMySubscription()); }
      catch { setSub(null); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <RecruiterLayout title="Invoices & Billing">
      {loading ? <p className="text-sm text-gray-400">Loading…</p>
        : !sub ? (
          <div className="bg-white border border-gray-200 p-8 text-center text-gray-500">
            No billing history yet.{' '}
            <Link to="/recruiter/billing/upgrade" className="text-blue-600 hover:underline">Choose a plan</Link>{' '}
            to get started.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Plan',           value: sub.planName ?? '—' },
                { label: 'Price',          value: fmtPrice(sub.planPrice, sub.planInterval) },
                { label: 'Job limit',      value: sub.jobLimit == null ? 'Unlimited' : sub.jobLimit },
                { label: 'Renews',         value: fmtDate(sub.currentPeriodEnd) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white border border-gray-200 px-5 py-4">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-sm font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Full detail table */}
            <div className="bg-white border border-gray-200">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Current Subscription</h2>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  sub.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : sub.status === 'trialing'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {sub.status}
                </span>
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {[
                    { label: 'Plan name',        value: sub.planName ?? '—' },
                    { label: 'Billing interval', value: sub.planInterval ?? '—' },
                    { label: 'Price',            value: fmtPrice(sub.planPrice, sub.planInterval) },
                    { label: 'Job posting limit',value: sub.jobLimit == null ? 'Unlimited' : sub.jobLimit },
                    { label: 'Current period ends', value: fmtDate(sub.currentPeriodEnd) },
                    { label: 'Status',           value: sub.status },
                    { label: 'Cancel at period end', value: sub.cancelAtPeriodEnd ? 'Yes — will not renew' : 'No — will auto-renew' },
                  ].map(({ label, value }) => (
                    <tr key={label}>
                      <td className="px-5 py-3 text-gray-500 w-48">{label}</td>
                      <td className="px-5 py-3 text-gray-900 font-medium">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
                Detailed receipts and invoices are available in your{' '}
                <Link to="/recruiter/billing/upgrade" className="text-blue-600 hover:underline">
                  payment provider's portal
                </Link>.
              </p>
            </div>
          </div>
        )}
    </RecruiterLayout>
  );
}
