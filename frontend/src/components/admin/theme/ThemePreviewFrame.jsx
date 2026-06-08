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
  const hasPath = iframePath !== null && iframePath !== undefined;

  return (
    <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
      <div className="bg-gray-950 flex items-center gap-3 px-4 py-2 flex-shrink-0 border-b border-gray-800">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 bg-gray-800 rounded px-3 py-1 text-center text-xs text-gray-300 font-mono">
          {hasPath ? `localhost:5173${iframePath}` : 'Global settings — no page URL'}
        </div>
        {hasPath && (
          <button type="button" onClick={onReload} className="text-gray-500 hover:text-white p-1" title="Reload preview">
            ↻
          </button>
        )}
      </div>

      <div
        ref={previewContainerRef}
        className="flex-1 relative overflow-hidden bg-gray-900 flex items-center justify-center p-3"
      >
        {!hasPath ? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-center px-8 rounded-lg w-full">
            <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium text-gray-500">Global settings apply site-wide</p>
            <p className="text-xs text-gray-400 mt-1">No page preview — changes affect every page</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      <div className="bg-gray-950 px-4 py-2 text-[10px] text-gray-500 border-t border-gray-800 flex justify-between">
        <span>
          {hasPath
            ? 'Hover sections to highlight · click to edit · drag in sidebar to reorder'
            : 'Select a section in the sidebar to edit its settings'}
        </span>
        <span className="text-gray-600">{Math.round(previewScale * 100)}% · {PREVIEW_WIDTH}px desktop</span>
      </div>
    </div>
  );
}
