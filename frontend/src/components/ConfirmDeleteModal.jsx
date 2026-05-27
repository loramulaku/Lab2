import Button from './Button';

export default function ConfirmDeleteModal({ message = 'Are you sure you want to delete this?', onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white border border-gray-200 p-6 w-full max-w-sm rounded-card shadow-soft">
        <p className="text-sm text-gray-700 mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="danger">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
