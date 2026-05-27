import { useDroppable } from '@dnd-kit/core';
import ApplicationKanbanCard from './ApplicationKanbanCard';

export default function ApplicationKanbanColumn({
  column,
  applications,
  showJobTitle,
  activeId,
  onOpen,
  onContextMenu,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { status: column.id },
  });

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] shrink-0">
      <div
        className={`bg-gray-100 rounded-t-lg px-4 py-3 border-b-2 ${column.border} flex items-center justify-between`}
      >
        <h3 className="text-sm font-semibold text-gray-800">{column.label}</h3>
        <span className="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
          {applications.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[420px] max-h-[calc(100vh-280px)] overflow-y-auto p-3 space-y-3 bg-gray-50/80 rounded-b-lg border border-t-0 border-gray-200 transition-colors ${
          isOver ? 'bg-blue-50/50' : ''
        }`}
      >
        {applications.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-lg py-10 px-4 text-center">
            <p className="text-sm text-gray-400">No applications</p>
          </div>
        ) : (
          applications.map((app) => (
            <div key={app.id} className="group/card">
              <ApplicationKanbanCard
                app={app}
                showJobTitle={showJobTitle}
                isDragging={activeId === String(app.id)}
                onOpen={onOpen}
                onContextMenu={onContextMenu}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
