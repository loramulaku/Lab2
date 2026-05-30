import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../services/subscriptionService';

const Subscription = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [plansData, subData] = await Promise.all([
          subscriptionService.getPlans(),
          subscriptionService.getMySubscription(),
        ]);
        setPlans(plansData);
        setCurrentSub(subData);
      } catch (err) {
        console.error('Failed to load subscription data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubscribe = async (planId) => {
    try {
      setSubscribing(planId);
      setError('');
      const { url } = await subscriptionService.createCheckoutSession(planId);
      window.location.href = url;
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to start checkout. Please try again.');
      setSubscribing(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will keep access until the end of the billing period.')) return;
    try {
      setCancelling(true);
      await subscriptionService.cancelSubscription();
      const subData = await subscriptionService.getMySubscription();
      setCurrentSub(subData);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/recruiter/dashboard')}
          className="mb-6 text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Subscription</h1>

        {currentSub && (
          <div className="bg-white border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Plan</h2>
            <div className="flex flex-wrap gap-6 items-start">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Plan</p>
                <p className="text-base font-medium text-gray-900 mt-1">{currentSub.planName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${
                  currentSub.status === 'active' ? 'bg-green-100 text-green-800' :
                  currentSub.status === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {currentSub.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {currentSub.cancelAtPeriodEnd ? 'Cancels On' : 'Renews On'}
                </p>
                <p className="text-base font-medium text-gray-900 mt-1">{formatDate(currentSub.currentPeriodEnd)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Job Limit</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {currentSub.jobLimit == null ? 'Unlimited' : currentSub.jobLimit}
                </p>
              </div>
            </div>

            {currentSub.status === 'active' && !currentSub.cancelAtPeriodEnd && (
              <div className="mt-4">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-4 py-2 border border-red-300 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </div>
            )}

            {currentSub.cancelAtPeriodEnd && (
              <p className="mt-4 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-2">
                Your subscription will be cancelled on {formatDate(currentSub.currentPeriodEnd)}. You still have full access until then.
              </p>
            )}
          </div>
        )}

        {!currentSub && (
          <div className="bg-yellow-50 border border-yellow-200 px-4 py-3 mb-8 text-sm text-yellow-800">
            You do not have an active subscription. Choose a plan below to start posting jobs.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 px-4 py-3 mb-6 text-sm text-red-700">
            {error}
          </div>
        )}

        <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Plans</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrentPlan = currentSub?.planId === plan.id && currentSub?.status === 'active';
            return (
              <div
                key={plan.id}
                className={`bg-white border p-6 flex flex-col ${isCurrentPlan ? 'border-blue-500' : 'border-gray-200'}`}
              >
                {isCurrentPlan && (
                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">Current Plan</span>
                )}
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${Number(plan.price).toFixed(2)}
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                </p>
                <p className="text-sm text-gray-600 mt-3">
                  {plan.jobLimit == null ? 'Unlimited job postings' : `Up to ${plan.jobLimit} job posting${plan.jobLimit !== 1 ? 's' : ''}`}
                </p>
                <div className="mt-auto pt-6">
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!subscribing || isCurrentPlan}
                    className={`w-full py-2 text-sm font-medium transition ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                    }`}
                  >
                    {subscribing === plan.id ? 'Redirecting...' : isCurrentPlan ? 'Active' : 'Subscribe'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {plans.length === 0 && (
          <p className="text-gray-500 text-sm">No plans available at the moment. Please check back later.</p>
        )}
      </div>
    </div>
  );
};

export default Subscription;
