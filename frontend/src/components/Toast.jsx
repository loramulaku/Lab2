export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;

  const styles =
    toast.type === 'error'
      ? 'bg-red-50 border-red-200 text-red-800'
      : 'bg-gray-900 border-gray-800 text-white';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-fade-in">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-md border text-sm font-medium shadow-md ${styles}`}
        role="status"
      >
        <span>{toast.message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
