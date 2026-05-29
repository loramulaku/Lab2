import { SECTION_LABELS } from '../../../constants/themeEditorMeta';

export default function SectionRow({
  section, index, total, isSelected, isDragging,
  onSelect, onMove, onToggleVisible,
  onDragStart, onDragOver, onDrop, onDragEnd,
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`group flex items-center gap-1 px-2 py-2 rounded-lg border transition-all ${
        isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : 'border-transparent hover:bg-gray-50'
      } ${isDragging ? 'opacity-40 scale-[0.98]' : ''} ${section.visible === false ? 'opacity-50' : ''}`}
    >
      <span className="cursor-grab text-gray-300 hover:text-gray-500 px-0.5 select-none" title="Drag to reorder">⠿</span>

      <button type="button" onClick={onSelect} className="flex-1 text-left min-w-0">
        <span className="text-xs font-medium text-gray-800 truncate block">
          {SECTION_LABELS[section.type] ?? section.type}
        </span>
      </button>

      <button type="button" onClick={onToggleVisible} title={section.visible !== false ? 'Hide' : 'Show'}
        className="p-1 text-gray-400 hover:text-gray-600 rounded">
        {section.visible !== false ? (
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.523 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd"/>
          </svg>
        )}
      </button>

      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" disabled={index === 0} onClick={() => onMove(-1)}
          className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 text-[10px] leading-none">▲</button>
        <button type="button" disabled={index === total - 1} onClick={() => onMove(1)}
          className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 text-[10px] leading-none">▼</button>
      </div>
    </div>
  );
}
