export default function FreelanceModeGate({ onActivate, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onMouseDown={onCancel}>
      <div className="bg-white border border-gray-200 shadow-xl w-full max-w-sm p-6" onMouseDown={e => e.stopPropagation()}>
        <h3 className="font-semibold text-gray-900 text-base mb-2">Freelance Mode required</h3>
        <p className="text-sm text-gray-600 mb-6">
          To add bids you should activate Freelance Mode on your account.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onActivate}
            className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Activate
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
