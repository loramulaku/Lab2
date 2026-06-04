import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionService } from '../../services/subscriptionService';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const confirm = async () => {
      try {
        const sub = await subscriptionService.confirmCheckoutSession(sessionId);
        setSubscription(sub);
      } catch (err) {
        console.error('Could not verify subscription:', err);
      } finally {
        setLoading(false);
      }
    };
    confirm();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white border border-gray-200 p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your <strong>{subscription?.planName ?? 'subscription'}</strong> plan is now active. You can start posting jobs right away.
        </p>
        {subscription && (
          <div className="bg-gray-50 border border-gray-200 px-4 py-3 mb-6 text-sm text-gray-700">
            <p>Plan: <strong>{subscription.planName}</strong></p>
            <p>Job limit: <strong>{subscription.jobLimit == null ? 'Unlimited' : subscription.jobLimit}</strong></p>
            <p>Renews: <strong>{subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : '—'}</strong></p>
          </div>
        )}
        <button
          onClick={() => navigate('/recruiter/dashboard')}
          className="w-full py-2 bg-blue-600 text-white font-medium text-sm hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
