import { THEME_EDITOR_PAGES } from '../../constants/themeEditorMeta';
import { useThemeEditor } from '../../hooks/useThemeEditor';
import ThemeEditorInspector from '../../components/admin/theme/ThemeEditorInspector';
import ThemePageSidebar from '../../components/admin/theme/ThemePageSidebar';
import ThemePreviewFrame from '../../components/admin/theme/ThemePreviewFrame';

export default function ThemeEditor() {
  const editor = useThemeEditor();

  const pageInfo   = THEME_EDITOR_PAGES.find(p => p.key === editor.activePage);
  const iframePath = pageInfo?.path ?? '/';

  return (
    <div className="flex -m-8" style={{ height: 'calc(100vh - 4rem)' }}>
      <ThemePageSidebar
        pages={THEME_EDITOR_PAGES}
        activePage={editor.activePage}
        onPageChange={editor.handlePageChange}
        sections={editor.currentSections}
        selectedSectionId={editor.selectedSectionId}
        onSelectSection={editor.setSelectedSectionId}
        onSelectGlobal={() => editor.setSelectedSectionId(null)}
        dragId={editor.dragId}
        onDragStart={editor.setDragId}
        onDragOver={() => {}}
        onDrop={targetId => { editor.reorderSections(editor.dragId, targetId); editor.setDragId(null); }}
        onDragEnd={() => editor.setDragId(null)}
        onMoveSection={editor.moveSection}
        onToggleVisible={editor.toggleSectionVisible}
      />

      <ThemePreviewFrame
        iframeRef={editor.iframeRef}
        previewContainerRef={editor.previewContainerRef}
        previewScale={editor.previewScale}
        iframePath={iframePath}
        pageLabel={pageInfo?.label ?? editor.activePage}
        activePageKey={editor.activePage}
        iframeLoading={editor.iframeLoading}
        onIframeLoad={editor.handleIframeLoad}
        onReload={editor.handleReloadPreview}
      />

      <ThemeEditorInspector
        saving={editor.saving}
        hasChanges={editor.hasChanges}
        message={editor.message}
        selectedSection={editor.selectedSection}
        liveConfig={editor.liveConfig}
        onSave={editor.handleSave}
        onRevert={editor.handleRevert}
        onResetToDefault={editor.handleResetToDefault}
        onSectionChange={(key, val) => {
          if (editor.selectedSection) editor.updateSectionSetting(editor.selectedSection.id, key, val);
        }}
        onToggleSectionVisible={() => {
          if (editor.selectedSection) editor.toggleSectionVisible(editor.selectedSection.id);
        }}
        onResetSection={() => {
          if (editor.selectedSection) editor.resetSection(editor.selectedSection.id);
        }}
        onGlobalChange={editor.updateGlobal}
      />
    </div>
  );
}
