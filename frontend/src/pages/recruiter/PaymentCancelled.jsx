import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';

const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <RecruiterLayout title="Payment Cancelled">
      <div className="max-w-md">
        <div className="page-shell-card rounded-xl p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
          <p className="text-gray-600 mb-6">Your payment was not completed. No charges were made.</p>
          <button
            onClick={() => navigate('/recruiter/billing/upgrade')}
            className="w-full py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700"
          >
            Back to Plans
          </button>
        </div>
      </div>
    </RecruiterLayout>
  );
};

export default PaymentCancelled;
