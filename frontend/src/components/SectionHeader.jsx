export default function SectionHeader({ title, onAdd, addLabel = '+ Add', action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {onAdd && (
        <button
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 text-sm transition flex items-center gap-1 rounded-none"
        >
          {addLabel}
        </button>
      )}
      {action}
    </div>
  );
}
