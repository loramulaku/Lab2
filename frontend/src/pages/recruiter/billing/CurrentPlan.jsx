import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RecruiterLayout from '../../../components/recruiter/RecruiterLayout';
import StatusBadge from '../../../components/recruiter/StatusBadge';
import { subscriptionService } from '../../../services/subscriptionService';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

export default function CurrentPlan() {
  const [sub, setSub] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    try { setSub(await subscriptionService.getMySubscription()); }
    catch { setSub(null); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const cancel = async () => {
    if (!confirm('Cancel your subscription? You keep access until the end of the billing period.')) return;
    setCancelling(true);
    try { await subscriptionService.cancelSubscription(); await load(); }
    catch (e) { alert(e?.response?.data?.message || 'Failed to cancel.'); }
    finally { setCancelling(false); }
  };

  return (
    <RecruiterLayout title="My Current Plan">
      {loading ? <p className="text-sm text-gray-400">Loading…</p>
        : !sub ? (
          <div className="bg-white border border-gray-200 p-8 text-center">
            <p className="text-gray-600">You don't have an active subscription.</p>
            <Link to="/recruiter/billing/upgrade" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700">Choose a plan</Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 p-6 max-w-2xl">
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Plan</p>
                <p className="text-base font-medium text-gray-900 mt-1">{sub.planName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {sub.planPrice != null
                    ? `$${Number(sub.planPrice).toFixed(2)}/${sub.planInterval === 'year' ? 'year' : 'month'}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                <div className="mt-1"><StatusBadge status={sub.status} /></div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{sub.cancelAtPeriodEnd ? 'Cancels On' : 'Renews On'}</p>
                <p className="text-base font-medium text-gray-900 mt-1">{fmtDate(sub.currentPeriodEnd)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Job Limit</p>
                <p className="text-base font-medium text-gray-900 mt-1">{sub.jobLimit == null ? 'Unlimited' : sub.jobLimit}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Link to="/recruiter/billing/upgrade" className="px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700">Change Plan</Link>
              {sub.status === 'active' && !sub.cancelAtPeriodEnd && (
                <button onClick={cancel} disabled={cancelling} className="px-4 py-2 border border-red-300 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50">
                  {cancelling ? 'Cancelling…' : 'Cancel Subscription'}
                </button>
              )}
            </div>

            {sub.cancelAtPeriodEnd && (
              <p className="mt-4 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-2">
                Your subscription will be cancelled on {fmtDate(sub.currentPeriodEnd)}. You keep full access until then.
              </p>
            )}
          </div>
        )}
    </RecruiterLayout>
  );
}
