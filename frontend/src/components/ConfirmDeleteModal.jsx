export default function ConfirmDeleteModal({ message = 'Are you sure you want to delete this?', onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white border border-gray-200 p-6 w-full max-w-sm shadow-lg">
        <p className="text-sm text-gray-700 mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition rounded-none"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium transition rounded-none"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
