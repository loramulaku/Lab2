import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../services/adminApi';
import { CMS_PAGES, findCmsField, getCmsDefault } from '../../../utils/cmsFields';
import { notifySiteContentUpdated } from '../../../utils/cmsEvents';
import { logError } from '../../../utils/safeLog';

const DEVICES = [
  { id: 'desktop', label: 'Desktop', width: '100%' },
  { id: 'tablet', label: 'Tablet', width: '768px' },
  { id: 'mobile', label: 'Mobile', width: '390px' },
];

function FieldInput({ field, value, savedValue, originalValue, focused, onChange, onFocus, onRevert }) {
  const dirty = value !== savedValue;
  const differsFromOriginal = value !== originalValue;
  const inputCls = `w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
    focused ? 'border-indigo-500 bg-indigo-50/50' : dirty ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200 bg-white'
  }`;

  return (
    <div id={`cms-field-${field.key}`} className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-gray-800">{field.label}</label>
        <div className="flex items-center gap-2 shrink-0">
          {differsFromOriginal && (
            <button
              type="button"
              onClick={() => onRevert(field.key)}
              className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
            >
              Revert to original
            </button>
          )}
          {dirty && <span className="text-[10px] font-semibold text-amber-600 uppercase">Edited</span>}
        </div>
      </div>
      {field.hint && <p className="text-xs text-gray-400">{field.hint}</p>}
      {field.type === 'textarea' ? (
        <textarea
          rows={field.key.includes('features') ? 5 : 3}
          value={value ?? ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          onFocus={() => onFocus(field.key)}
          className={`${inputCls} resize-y min-h-[72px]`}
        />
      ) : (
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          onFocus={() => onFocus(field.key)}
          className={inputCls}
        />
      )}
    </div>
  );
}

/**
 * Full-screen Shopify-style theme editor.
 * Layout: pages + sections (left) · live preview (center) · active section fields (right).
 * Scales cleanly as more pages/sections are added to cmsFields.js.
 */
export default function VisualContentEditor() {
  const [activePageId, setActivePageId] = useState(CMS_PAGES[0].id);
  const [activeSectionId, setActiveSectionId] = useState(CMS_PAGES[0].groups[0].id);
  const [saved, setSaved] = useState({});
  const [drafts, setDrafts] = useState({});
  const [focusedKey, setFocusedKey] = useState(null);
  const [device, setDevice] = useState('desktop');
  const [pageSearch, setPageSearch] = useState('');
  const [fieldSearch, setFieldSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [previewEpoch, setPreviewEpoch] = useState(0);
  const [toast, setToast] = useState(null);
  const iframeRef = useRef(null);

  const activePage = CMS_PAGES.find((p) => p.id === activePageId) ?? CMS_PAGES[0];
  const activeSection = activePage.groups.find((g) => g.id === activeSectionId) ?? activePage.groups[0];

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSiteContent();
      const map = Object.fromEntries(data.map((i) => [i.key, i.value ?? '']));
      setSaved(map);
      setDrafts(map);
    } catch (err) {
      logError('Failed to load content', err);
      showToast('Failed to load content', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const pushPreview = useCallback((overrides) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'CMS_PREVIEW', overrides },
      window.location.origin
    );
  }, []);

  // Re-push whenever drafts change (live preview while typing).
  useEffect(() => {
    if (!loading) pushPreview(drafts);
  }, [drafts, loading, pushPreview]);

  // Iframe signals when its React tree is mounted and ready to receive preview data.
  useEffect(() => {
    const onReady = (e) => {
      if (e.origin !== window.location.origin || e.data?.type !== 'CMS_PREVIEW_READY') return;
      pushPreview(drafts);
    };
    window.addEventListener('message', onReady);
    return () => window.removeEventListener('message', onReady);
  }, [drafts, pushPreview]);

  const selectPage = (pageId) => {
    const page = CMS_PAGES.find((p) => p.id === pageId);
    if (!page) return;
    setActivePageId(pageId);
    setActiveSectionId(page.groups[0].id);
    setFieldSearch('');
  };

  const selectSection = (sectionId) => {
    setActiveSectionId(sectionId);
    setFieldSearch('');
  };

  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin || e.data?.type !== 'CMS_FOCUS') return;
      const meta = findCmsField(e.data.key);
      if (!meta) return;
      setFocusedKey(meta.key);
      setActivePageId(meta.pageId);
      setActiveSectionId(meta.groupId);
      setTimeout(() => {
        document.getElementById(`cms-field-${meta.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const handleChange = (key, value) => setDrafts((prev) => ({ ...prev, [key]: value }));

  const handleRevert = (key) => {
    const original = getCmsDefault(key);
    setDrafts((prev) => ({ ...prev, [key]: original }));
    showToast('Reverted to original text');
  };

  const handleRevertSection = () => {
    const updates = Object.fromEntries(
      activeSection.fields.map((f) => [f.key, getCmsDefault(f.key)])
    );
    setDrafts((prev) => ({ ...prev, ...updates }));
    showToast(`Reverted ${activeSection.fields.length} field${activeSection.fields.length > 1 ? 's' : ''} to original`);
  };

  const sectionDiffersFromOriginal = activeSection.fields.some(
    (f) => (drafts[f.key] ?? '') !== getCmsDefault(f.key)
  );

  const handleFocus = (key) => {
    setFocusedKey(key);
    iframeRef.current?.contentWindow?.postMessage({ type: 'CMS_FOCUS', key }, window.location.origin);
  };

  const dirtyKeys = useMemo(
    () => Object.keys(drafts).filter((k) => drafts[k] !== saved[k]),
    [drafts, saved]
  );

  const pageDirtyCount = useCallback(
    (page) => {
      const keys = new Set(page.groups.flatMap((g) => g.fields.map((f) => f.key)));
      return dirtyKeys.filter((k) => keys.has(k)).length;
    },
    [dirtyKeys]
  );

  const sectionDirtyCount = useCallback(
    (section) => section.fields.filter((f) => drafts[f.key] !== saved[f.key]).length,
    [drafts, saved]
  );

  const visibleFields = useMemo(() => {
    const q = fieldSearch.trim().toLowerCase();
    if (!q) return activeSection.fields;
    return activeSection.fields.filter(
      (f) => f.label.toLowerCase().includes(q) || f.key.toLowerCase().includes(q)
    );
  }, [activeSection, fieldSearch]);

  const filteredPages = useMemo(() => {
    const q = pageSearch.trim().toLowerCase();
    if (!q) return CMS_PAGES;
    return CMS_PAGES.filter(
      (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [pageSearch]);

  const handlePublish = async () => {
    if (!dirtyKeys.length) return;
    try {
      setPublishing(true);
      await Promise.all(dirtyKeys.map((key) => adminApi.upsertSiteContent(key, drafts[key] ?? '')));
      setSaved({ ...drafts });
      pushPreview(drafts);
      setPreviewEpoch((n) => n + 1);
      notifySiteContentUpdated();
      showToast(`Published ${dirtyKeys.length} change${dirtyKeys.length > 1 ? 's' : ''}`);
    } catch (err) {
      logError('Publish failed', err);
      showToast('Publish failed', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleDiscard = () => {
    setDrafts({ ...saved });
    pushPreview(saved);
    showToast('Changes discarded');
  };

  const previewSrc = `${window.location.origin}${activePage.path}?cmsPreview=1`;
  const deviceWidth = DEVICES.find((d) => d.id === device)?.width ?? '100%';

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading theme editor…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* ── Top bar ── */}
      <header className="flex-shrink-0 h-12 flex items-center justify-between px-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/admin"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Admin
          </Link>
          <span className="text-gray-700">|</span>
          <span className="text-sm font-semibold text-white shrink-0">Theme editor</span>
          <span className="text-gray-600 hidden sm:inline">·</span>
          <span className="text-sm text-gray-400 truncate hidden sm:inline">{activePage.title}</span>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-gray-800 rounded-lg p-0.5">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              onClick={() => setDevice(d.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                device === d.id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {dirtyKeys.length > 0 && (
            <>
              <span className="text-xs text-amber-400 hidden sm:inline">
                {dirtyKeys.length} unsaved
              </span>
              <button onClick={handleDiscard} className="text-xs text-gray-400 hover:text-white">
                Discard
              </button>
            </>
          )}
          <button
            onClick={handlePublish}
            disabled={!dirtyKeys.length || publishing}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-sm font-semibold rounded-lg transition"
          >
            {publishing ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* ── Left: pages + sections ── */}
        <nav className="w-56 flex-shrink-0 flex flex-col border-r border-gray-800 bg-gray-900 overflow-hidden">
          <div className="p-3 border-b border-gray-800">
            <input
              type="search"
              value={pageSearch}
              onChange={(e) => setPageSearch(e.target.value)}
              placeholder="Search pages…"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Pages</p>
            {filteredPages.map((page) => {
              const dirty = pageDirtyCount(page);
              const isActive = page.id === activePageId;
              return (
                <button
                  key={page.id}
                  onClick={() => selectPage(page.id)}
                  className={`w-full text-left px-3 py-2 text-sm transition flex items-center justify-between gap-2 ${
                    isActive ? 'bg-indigo-600/20 text-indigo-300 border-r-2 border-indigo-500' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="truncate">{page.title}</span>
                  {dirty > 0 && (
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-bold text-gray-900 flex items-center justify-center">
                      {dirty}
                    </span>
                  )}
                </button>
              );
            })}

            <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Sections</p>
            {activePage.groups.map((group) => {
              const dirty = sectionDirtyCount(group);
              const isActive = group.id === activeSectionId;
              return (
                <button
                  key={group.id}
                  onClick={() => selectSection(group.id)}
                  className={`w-full text-left px-3 py-2 text-sm transition flex items-center justify-between gap-2 ${
                    isActive ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-800/60 hover:text-gray-300'
                  }`}
                >
                  <span className="truncate pl-2">{group.title}</span>
                  {dirty > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ── Center: preview ── */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#1a1a2e]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800/50">
            <p className="text-xs text-gray-500">Click highlighted text in the preview to jump to its field</p>
            {pageDirtyCount(activePage) > 0 && (
              <span className="text-xs text-amber-400">{pageDirtyCount(activePage)} unsaved on this page</span>
            )}
          </div>
          <div className="flex-1 flex items-start justify-center overflow-auto p-6">
            <div
              className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-200"
              style={{ width: deviceWidth, maxWidth: '100%', height: '100%', minHeight: 560 }}
            >
              <iframe
                ref={iframeRef}
                key={`${activePageId}-${previewEpoch}`}
                src={previewSrc}
                title={`Preview: ${activePage.title}`}
                className="w-full h-full border-0"
                onLoad={() => pushPreview(drafts)}
              />
            </div>
          </div>
        </main>

        {/* ── Right: active section fields only ── */}
        <aside className="w-80 flex-shrink-0 flex flex-col border-l border-gray-800 bg-white text-gray-900">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{activePage.title}</p>
                <h2 className="font-semibold text-gray-900">{activeSection.title}</h2>
              </div>
              {sectionDiffersFromOriginal && (
                <button
                  type="button"
                  onClick={handleRevertSection}
                  className="shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                >
                  Revert section
                </button>
              )}
            </div>
          </div>

          <div className="px-4 py-2 border-b border-gray-100">
            <input
              type="search"
              value={fieldSearch}
              onChange={(e) => setFieldSearch(e.target.value)}
              placeholder="Filter fields…"
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {visibleFields.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No fields match your search</p>
            ) : (
              visibleFields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={drafts[field.key] ?? ''}
                  savedValue={saved[field.key] ?? ''}
                  originalValue={getCmsDefault(field.key)}
                  focused={focusedKey === field.key}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onRevert={handleRevert}
                />
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            Edits preview instantly · <strong>Publish</strong> saves for all visitors
          </div>
        </aside>
      </div>

      {toast && (
        <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-white animate-fade-in ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
