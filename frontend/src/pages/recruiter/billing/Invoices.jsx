import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RecruiterLayout from '../../../components/recruiter/RecruiterLayout';
import { subscriptionService } from '../../../services/subscriptionService';

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  : '—';

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
      <p className="text-sm text-gray-500 mb-6">
        Your billing history and active billing record.{' '}
        <Link to="/recruiter/billing/plan" className="text-blue-600 hover:underline">
          Manage your plan →
        </Link>
      </p>

      {loading ? <p className="text-sm text-gray-400">Loading…</p>
        : !sub ? (
          <div className="bg-white border border-gray-200 p-8 text-center text-gray-500">
            No billing records yet.{' '}
            <Link to="/recruiter/billing/upgrade" className="text-blue-600 hover:underline">Choose a plan</Link>{' '}
            to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Invoice record header */}
            <div className="bg-white border border-gray-200">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-800">Active Billing Record</span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    sub.status === 'active'   ? 'bg-green-100 text-green-700'
                    : sub.status === 'trialing' ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sub.status}
                  </span>
                </div>
                {sub.cancelAtPeriodEnd && (
                  <span className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded">
                    Cancels on {fmtDate(sub.currentPeriodEnd)}
                  </span>
                )}
              </div>

              {/* Billing line items */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-100">
                    <th className="px-5 py-3 font-medium text-gray-500">Description</th>
                    <th className="px-5 py-3 font-medium text-gray-500">Billing interval</th>
                    <th className="px-5 py-3 font-medium text-gray-500">Amount</th>
                    <th className="px-5 py-3 font-medium text-gray-500">
                      {sub.cancelAtPeriodEnd ? 'Cancels on' : 'Next renewal'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {sub.planName ?? 'Subscription'}
                      {sub.jobLimit != null && (
                        <span className="ml-2 text-xs text-gray-400 font-normal">
                          ({sub.jobLimit} job posting{sub.jobLimit !== 1 ? 's' : ''} included)
                        </span>
                      )}
                      {sub.jobLimit == null && (
                        <span className="ml-2 text-xs text-gray-400 font-normal">(unlimited job postings)</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-700 capitalize">
                      {sub.planInterval ?? 'monthly'}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-semibold">
                      {sub.planPrice != null
                        ? `$${Number(sub.planPrice).toFixed(2)}`
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{fmtDate(sub.currentPeriodEnd)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Itemised receipts and past invoices are available in your payment provider's portal.
                </p>
                <Link
                  to="/recruiter/billing/plan"
                  className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                >
                  Manage subscription →
                </Link>
              </div>
            </div>

            {/* Note about Stripe portal */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-5 py-4 text-sm text-blue-800">
              <strong>Need a receipt?</strong> Detailed invoices and payment receipts are managed by our payment
              provider (Stripe). You can access them any time through the payment portal linked on the{' '}
              <Link to="/recruiter/billing/upgrade" className="underline hover:text-blue-900">
                Buy / Upgrade
              </Link>{' '}
              page.
            </div>
          </div>
        )}
    </RecruiterLayout>
  );
}
