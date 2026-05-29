import { PREVIEW_HEIGHT, PREVIEW_WIDTH } from '../../../constants/themeEditorMeta';
import SectionRow from './SectionRow';

export default function ThemePageSidebar({
  pages, activePage, onPageChange,
  sections, selectedSectionId, onSelectSection, onSelectGlobal,
  dragId, onDragStart, onDragOver, onDrop, onDragEnd,
  onMoveSection, onToggleVisible,
}) {
  return (
    <div className="w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pages</p>
        {pages.map(p => (
          <button key={p.key} type="button" onClick={() => onPageChange(p.key)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
              activePage === p.key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">Sections</p>
        <p className="text-[10px] text-gray-400 mb-3 px-1 leading-relaxed">
          Drag to reorder · click preview to select
        </p>

        <div className="space-y-0.5">
          {sections.map((section, index) => (
            <SectionRow
              key={section.id}
              section={section}
              index={index}
              total={sections.length}
              isSelected={selectedSectionId === section.id}
              isDragging={dragId === section.id}
              onSelect={() => onSelectSection(section.id)}
              onMove={delta => onMoveSection(section.id, delta)}
              onToggleVisible={() => onToggleVisible(section.id)}
              onDragStart={() => onDragStart(section.id)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(section.id)}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>

        <button type="button" onClick={onSelectGlobal}
          className={`w-full mt-2 text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            !selectedSectionId ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:bg-gray-50'
          }`}>
          Global Colors & Fonts
        </button>
      </div>
    </div>
  );
}
