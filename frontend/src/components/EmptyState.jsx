export default function EmptyState({ message, onAdd, addLabel = 'Add one' }) {
  return (
    <div className="py-6 text-center">
      <p className="text-sm text-gray-400">{message}</p>
      {onAdd && (
        <button
          onClick={onAdd}
          className="mt-2 text-sm text-blue-600 hover:underline font-medium"
        >
          {addLabel}
        </button>
      )}
    </div>
  );
}
