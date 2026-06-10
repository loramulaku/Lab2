import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RecruiterLayout from '../../../components/recruiter/RecruiterLayout';
import StatusBadge from '../../../components/recruiter/StatusBadge';
import { subscriptionService } from '../../../services/subscriptionService';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

export default function CurrentPlan() {
  const [sub, setSub] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling]     = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelError, setCancelError]   = useState('');

  const load = async () => {
    try { setSub(await subscriptionService.getMySubscription()); }
    catch { setSub(null); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const cancel = async () => {
    setCancelling(true);
    setCancelError('');
    try { await subscriptionService.cancelSubscription(); setConfirmCancel(false); await load(); }
    catch (e) { setCancelError(e?.response?.data?.message || 'Failed to cancel.'); }
    finally { setCancelling(false); }
  };

  return (
    <RecruiterLayout title="My Current Plan">
      {loading ? <p className="text-sm text-gray-400">Loading…</p>
        : !sub ? (
          <div className="page-shell-card rounded-xl p-8 text-center">
            <p className="text-gray-600">You don't have an active subscription.</p>
            <Link to="/recruiter/billing/upgrade" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Choose a plan</Link>
          </div>
        ) : (
          <div className="page-shell-card rounded-xl p-6 max-w-2xl">
            {/* Prominent expiry / renewal banner */}
            {sub.currentPeriodEnd && (
              <div className={`mb-5 rounded-lg px-4 py-3 border ${
                sub.cancelAtPeriodEnd
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : 'bg-blue-50 border-blue-100 text-blue-800'
              }`}>
                <p className="text-sm font-semibold">
                  {sub.cancelAtPeriodEnd ? 'Plan expires on ' : 'Valid until '}
                  <span className="text-base">{fmtDate(sub.currentPeriodEnd)}</span>
                </p>
                {!sub.cancelAtPeriodEnd && (
                  <p className="text-xs mt-0.5 opacity-80">
                    Your plan auto-renews each billing cycle. Cancel any time to stop renewals.
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-xs text-gray-500 font-medium">Plan</p>
                <p className="text-base font-medium text-gray-900 mt-1">{sub.planName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Price</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {sub.planPrice != null
                    ? `$${Number(sub.planPrice).toFixed(2)}/${sub.planInterval === 'year' ? 'year' : 'month'}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Status</p>
                <div className="mt-1"><StatusBadge status={sub.status} /></div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Job Limit</p>
                <p className="text-base font-medium text-gray-900 mt-1">{sub.jobLimit == null ? 'Unlimited' : sub.jobLimit}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Link to="/recruiter/billing/upgrade" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Change Plan</Link>
              {sub.status === 'active' && !sub.cancelAtPeriodEnd && !confirmCancel && (
                <button onClick={() => setConfirmCancel(true)} className="px-4 py-2 border border-red-300 text-red-600 text-sm hover:bg-red-50 rounded-lg">
                  Cancel Subscription
                </button>
              )}
            </div>

            {confirmCancel && (
              <div className="mt-4 border border-red-200 bg-red-50 rounded-lg px-4 py-3">
                <p className="text-sm text-red-800 mb-3">
                  Cancel your subscription? You keep full access until the end of the billing period.
                </p>
                {cancelError && <p className="text-xs text-red-600 mb-2">{cancelError}</p>}
                <div className="flex gap-2">
                  <button onClick={cancel} disabled={cancelling}
                    className="px-4 py-1.5 bg-red-600 text-white text-sm hover:bg-red-700 rounded-lg disabled:opacity-50">
                    {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                  </button>
                  <button onClick={() => { setConfirmCancel(false); setCancelError(''); }}
                    className="px-4 py-1.5 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 rounded-lg">
                    Keep subscription
                  </button>
                </div>
              </div>
            )}

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
