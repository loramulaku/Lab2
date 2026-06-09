const DefaultIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

export default function EmptyState({ message, onAdd, addLabel = 'Add one', icon }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6 rounded-xl border border-dashed border-blue-200/70 bg-white/30">
      <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center mb-3">
        {icon ?? <DefaultIcon />}
      </div>
      <p className="text-sm text-gray-500 max-w-xs">{message}</p>
      {onAdd && (
        <button
          onClick={onAdd}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          {addLabel}
        </button>
      )}
    </div>
  );
}
