import { Link } from 'react-router-dom';

export default function GuestAuthPrompt({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Create a free account</h2>
          <p className="text-sm text-gray-500 mb-6">
            You need an account to apply for jobs or submit bids. It's free and takes less than a minute.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/register"
              className="block w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="block w-full border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign in
            </Link>
          </div>
          <button
            onClick={onClose}
            className="mt-5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
