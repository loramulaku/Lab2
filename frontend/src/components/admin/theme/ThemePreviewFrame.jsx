import { PREVIEW_HEIGHT, PREVIEW_WIDTH } from '../../../constants/themeEditorMeta';

export default function ThemePreviewFrame({
  iframeRef,
  previewContainerRef,
  previewScale,
  iframePath,
  pageLabel,
  activePageKey,
  iframeLoading,
  onIframeLoad,
  onReload,
}) {
  return (
    <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
      <div className="bg-gray-950 flex items-center gap-3 px-4 py-2 flex-shrink-0 border-b border-gray-800">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 bg-gray-800 rounded px-3 py-1 text-center text-xs text-gray-300 font-mono">
          localhost:5173{iframePath}
        </div>
        <button type="button" onClick={onReload} className="text-gray-500 hover:text-white p-1" title="Reload preview">
          ↻
        </button>
      </div>

      <div
        ref={previewContainerRef}
        className="flex-1 relative overflow-hidden bg-gray-900 flex items-center justify-center p-3"
      >
        {iframeLoading && (
          <div className="absolute inset-0 bg-gray-800/90 flex items-center justify-center z-10">
            <p className="text-sm text-gray-400 animate-pulse">Loading page…</p>
          </div>
        )}
        <div
          className="relative overflow-hidden rounded-lg shadow-2xl ring-1 ring-gray-700"
          style={{
            width:  PREVIEW_WIDTH  * previewScale,
            height: PREVIEW_HEIGHT * previewScale,
          }}
        >
          <iframe
            key={activePageKey}
            ref={iframeRef}
            src={iframePath}
            title={`${pageLabel} preview`}
            className="border-0 bg-white block"
            style={{
              width:           PREVIEW_WIDTH,
              height:          PREVIEW_HEIGHT,
              transform:       `scale(${previewScale})`,
              transformOrigin: 'top left',
            }}
            onLoad={onIframeLoad}
          />
        </div>
      </div>

      <div className="bg-gray-950 px-4 py-2 text-[10px] text-gray-500 border-t border-gray-800 flex justify-between">
        <span>Hover sections to highlight · click to edit · drag in sidebar to reorder</span>
        <span className="text-gray-600">{Math.round(previewScale * 100)}% · {PREVIEW_WIDTH}px desktop</span>
      </div>
    </div>
  );
}
