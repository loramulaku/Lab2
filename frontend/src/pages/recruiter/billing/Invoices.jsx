import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RecruiterLayout from '../../../components/recruiter/RecruiterLayout';
import StatusBadge from '../../../components/recruiter/StatusBadge';
import { subscriptionService } from '../../../services/subscriptionService';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

/**
 * Invoices & Billing History.
 * The current API exposes the active subscription (its plan, price and period).
 * Itemised Stripe invoices are managed in the Stripe customer portal; here we
 * surface the active billing record derived from the subscription.
 */
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
    <RecruiterLayout title="Invoices & Billing History">
      {loading ? <p className="text-sm text-gray-400">Loading…</p>
        : !sub ? (
          <div className="bg-white border border-gray-200 p-8 text-center text-gray-500">
            No billing history yet. <Link to="/recruiter/billing/upgrade" className="text-blue-600 hover:underline">Choose a plan</Link> to get started.
          </div>
        ) : (
          <div className="bg-white border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Period ends</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="px-5 py-3 text-gray-900">{sub.planName}</td>
                  <td className="px-5 py-3 text-gray-700">{fmtDate(sub.currentPeriodEnd)}</td>
                  <td className="px-5 py-3"><StatusBadge status={sub.status} /></td>
                </tr>
              </tbody>
            </table>
            <p className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
              Detailed receipts are available in your payment provider's portal.
            </p>
          </div>
        )}
    </RecruiterLayout>
  );
}
