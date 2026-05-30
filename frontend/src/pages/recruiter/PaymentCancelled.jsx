import { useNavigate } from 'react-router-dom';

const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white border border-gray-200 p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">
          Your payment was not completed. No charges were made.
        </p>
        <button
          onClick={() => navigate('/recruiter/subscription')}
          className="w-full py-2 bg-blue-600 text-white font-medium text-sm hover:bg-blue-700"
        >
          Back to Plans
        </button>
      </div>
    </div>
  );
};

export default PaymentCancelled;
