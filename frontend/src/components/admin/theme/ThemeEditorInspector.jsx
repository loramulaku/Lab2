import GlobalColorsPanel from './GlobalColorsPanel';
import PropertiesPanel from './PropertiesPanel';

export default function ThemeEditorInspector({
  saving,
  hasChanges,
  message,
  selectedSection,
  liveConfig,
  onSave,
  onRevert,
  onResetToDefault,
  onSectionChange,
  onToggleSectionVisible,
  onResetSection,
  onGlobalChange,
}) {
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-100 space-y-2 flex-shrink-0">
        <div className="flex gap-2">
          <button type="button" onClick={onSave} disabled={saving || !hasChanges}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg disabled:opacity-40 transition-colors">
            {saving ? 'Saving…' : hasChanges ? '● Save & Apply' : 'Save & Apply'}
          </button>
          <button type="button" onClick={onRevert} disabled={!hasChanges}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
            Revert
          </button>
        </div>
        <button type="button" onClick={onResetToDefault}
          className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">
          Reset all to factory defaults
        </button>
        {message && (
          <p className={`text-xs px-3 py-2 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedSection ? (
          <PropertiesPanel
            section={selectedSection}
            onChange={onSectionChange}
            onToggleVisible={onToggleSectionVisible}
            onResetSection={onResetSection}
          />
        ) : (
          <GlobalColorsPanel config={liveConfig} onChange={onGlobalChange} />
        )}
      </div>
    </div>
  );
}
