export default function ApplicationContextMenu({ menu, onAction, onClose }) {
  if (!menu) return null;

  const items = [
    { id: 'view', label: 'View' },
    ...(menu.app.resumePath ? [{ id: 'download', label: 'Download resume' }] : []),
    ...(menu.app.status !== 'rejected' ? [{ id: 'reject', label: 'Reject' }] : []),
    ...(menu.app.status !== 'rejected' ? [{ id: 'archive', label: 'Archive' }] : []),
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />
      <div
        className="fixed z-50 min-w-[160px] bg-white border border-gray-200 rounded-md shadow-lg py-1 animate-fade-in"
        style={{ top: menu.y, left: menu.x }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onAction(item.id, menu.app)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
              item.id === 'reject' ? 'text-red-600' : 'text-gray-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
