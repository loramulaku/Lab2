import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionService } from '../../services/subscriptionService';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const confirm = async () => {
      const sessionId = searchParams.get('session_id');
      try {
        if (sessionId) {
          // Confirm directly from Stripe session — works even without webhooks
          const sub = await subscriptionService.confirmCheckout(sessionId);
          setSubscription(sub);
        } else {
          // Fallback: poll the subscription endpoint
          await new Promise((r) => setTimeout(r, 2000));
          const sub = await subscriptionService.getMySubscription();
          setSubscription(sub);
        }
      } catch (err) {
        console.error('Could not confirm subscription:', err);
        const apiMsg = err?.response?.data?.message ?? '';
        // Map common Stripe decline reasons to clear user messages
        let msg = 'Payment was received but we could not confirm your plan. Please refresh or contact support.';
        if (apiMsg.toLowerCase().includes('declined'))           msg = 'Your card was declined. Please try a different payment method.';
        else if (apiMsg.toLowerCase().includes('insufficient'))  msg = 'Your card has insufficient funds. Please use a different card.';
        else if (apiMsg.toLowerCase().includes('not completed')) msg = 'Payment was not completed. Please try again or use a different card.';
        else if (apiMsg)                                          msg = apiMsg;
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    confirm();
  }, [searchParams]);

  if (loading) {
    return (
      <RecruiterLayout title="Payment Confirmation">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Confirming your payment…</p>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout title="Payment Successful">
      <div className="max-w-md">
      <div className="page-shell-card rounded-xl p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your <strong>{subscription?.planName ?? 'subscription'}</strong> plan is now active. You can start posting jobs right away.
        </p>

        {error && (
          <p className="mb-4 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-2">{error}</p>
        )}

        {subscription && (
          <div className="bg-gray-50 border border-gray-200 px-4 py-3 mb-6 text-sm text-gray-700 text-left">
            <p>Plan: <strong>{subscription.planName}</strong></p>
            <p>Job limit: <strong>{subscription.jobLimit == null ? 'Unlimited' : subscription.jobLimit}</strong></p>
            <p>Renews: <strong>{subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : '—'}</strong></p>
          </div>
        )}

        <button
          onClick={() => navigate('/recruiter/jobs')}
          className="w-full py-2 bg-blue-600 text-white font-medium text-sm hover:bg-blue-700"
        >
          Start Posting Jobs
        </button>
      </div>
      </div>
    </RecruiterLayout>
  );
};

export default PaymentSuccess;
