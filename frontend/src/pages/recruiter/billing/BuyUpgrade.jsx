import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RecruiterLayout from '../../../components/recruiter/RecruiterLayout';
import { subscriptionService } from '../../../services/subscriptionService';

export default function BuyUpgrade() {
  const location = useLocation();
  const reason = location.state?.reason;
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [p, s] = await Promise.allSettled([
          subscriptionService.getPlans(),
          subscriptionService.getMySubscription(),
        ]);
        if (p.status === 'fulfilled') setPlans(p.value);
        if (s.status === 'fulfilled') setCurrentSub(s.value);
      } finally { setLoading(false); }
    })();
  }, []);

  const subscribe = async (planId) => {
    try {
      setSubscribing(planId);
      setError('');
      const { url } = await subscriptionService.createCheckoutSession(planId);
      window.location.href = url;
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to start checkout.');
      setSubscribing(null);
    }
  };

  return (
    <RecruiterLayout title="Buy / Upgrade Plan">
      {reason && (
        <div className="bg-yellow-50 border border-yellow-200 px-4 py-3 mb-6 text-sm text-yellow-800">
          {reason} — choose or upgrade a plan to continue posting.
        </div>
      )}
      {error && <div className="bg-red-50 border border-red-200 px-4 py-3 mb-6 text-sm text-red-700">{error}</div>}

      {loading ? <p className="text-sm text-gray-400">Loading…</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => {
            const isCurrent = currentSub?.planId === plan.id && currentSub?.status === 'active';
            return (
              <div key={plan.id} className={`bg-white border p-6 flex flex-col ${isCurrent ? 'border-blue-500' : 'border-gray-200'}`}>
                {isCurrent && <span className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">Current Plan</span>}
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">${Number(plan.price).toFixed(2)}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                <p className="text-sm text-gray-600 mt-3">
                  {plan.jobLimit == null ? 'Unlimited job postings' : `Up to ${plan.jobLimit} job posting${plan.jobLimit !== 1 ? 's' : ''}`}
                </p>
                <div className="mt-auto pt-6">
                  <button onClick={() => subscribe(plan.id)} disabled={!!subscribing || isCurrent}
                    className={`w-full py-2 text-sm font-medium transition ${isCurrent ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'}`}>
                    {subscribing === plan.id ? 'Redirecting…' : isCurrent ? 'Active' : 'Subscribe'}
                  </button>
                </div>
              </div>
            );
          })}
          {plans.length === 0 && <p className="text-gray-500 text-sm">No plans available at the moment.</p>}
        </div>
      )}
    </RecruiterLayout>
  );
}
