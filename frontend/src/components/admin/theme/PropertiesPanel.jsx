import { SECTION_FIELDS, SECTION_LABELS } from '../../../constants/themeEditorMeta';
import FieldInput from './FieldInput';

export default function PropertiesPanel({ section, onChange, onToggleVisible, onResetSection }) {
  const fields = SECTION_FIELDS[section.type] ?? [];

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <h3 className="font-semibold text-gray-900 text-sm">
            {SECTION_LABELS[section.type] ?? section.type}
          </h3>
        </div>
        <button type="button" onClick={onResetSection}
          className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">
          Reset section
        </button>
      </div>

      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
        <input type="checkbox" checked={section.visible !== false} onChange={onToggleVisible}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        Visible on page
      </label>

      {fields.map(field => (
        <div key={field.key}>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">{field.label}</label>
          <FieldInput field={field} value={section.settings[field.key]}
            onChange={val => onChange(field.key, val)} />
        </div>
      ))}
    </div>
  );
}
