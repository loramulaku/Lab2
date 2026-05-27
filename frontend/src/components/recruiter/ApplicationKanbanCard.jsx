import { useDraggable } from '@dnd-kit/core';
import { Bars2Icon } from '@heroicons/react/24/outline';
import { companyInitials } from '../../utils/format';
import { avatarColor, candidateName } from '../../utils/kanban';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ApplicationKanbanCard({
  app,
  showJobTitle,
  isDragging,
  onOpen,
  onContextMenu,
}) {
  const name = candidateName(app);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: String(app.id),
    data: { app, status: app.status },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onOpen(app)}
      onContextMenu={(e) => onContextMenu(e, app)}
      className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 rotate-2 shadow-xl z-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {app.candidateAvatar ? (
          <img
            src={`${API_BASE}${app.candidateAvatar}`}
            alt=""
            className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(name)}`}
          >
            {companyInitials(name)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
            <button
              type="button"
              className="text-gray-300 hover:text-gray-500 shrink-0 opacity-0 group-hover/card:opacity-100"
              {...listeners}
              {...attributes}
              onClick={(e) => e.stopPropagation()}
              aria-label="Drag application"
            >
              <Bars2Icon className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Applied {formatDate(app.appliedAt)}</p>
          {showJobTitle && (
            <p className="text-xs text-gray-600 mt-2 truncate">{app.jobTitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpen(app); }}
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          View profile
        </button>
        {app.resumePath && (
          <a
            href={`${API_BASE}${app.resumePath}`}
            download
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium text-gray-600 hover:text-gray-800"
          >
            Download resume
          </a>
        )}
      </div>
    </div>
  );
}
