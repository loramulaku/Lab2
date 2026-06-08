import { useCallback, useEffect, useRef, useState } from 'react';
import { themeService } from '../services/themeService';
import { DEFAULT_THEME_CONFIG } from '../constants/themeDefaults';
import { PREVIEW_HEIGHT, PREVIEW_WIDTH } from '../constants/themeEditorMeta';
import { normalizeThemeConfig } from '../utils/normalizeThemeConfig';

export function useThemeEditor() {
  const iframeRef = useRef(null);
  const previewContainerRef = useRef(null);

  const [previewScale, setPreviewScale]         = useState(1);
  const [liveConfig, setLiveConfig]             = useState(DEFAULT_THEME_CONFIG);
  const [savedConfig, setSavedConfig]           = useState(DEFAULT_THEME_CONFIG);
  const [themeId, setThemeId]                   = useState(null);
  const [hasChanges, setHasChanges]             = useState(false);
  const [activePage, setActivePage]             = useState('home');
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [dragId, setDragId]                     = useState(null);
  const [saving, setSaving]                     = useState(false);
  const [message, setMessage]                   = useState(null);
  const [iframeLoading, setIframeLoading]       = useState(true);

  const pushToIframe = useCallback((config) => {
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'THEME_UPDATE', config }, '*');
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { pushToIframe(liveConfig); }, [liveConfig, pushToIframe]);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'IFRAME_READY') pushToIframe(liveConfig);
      if (e.data?.type === 'SECTION_CLICKED') setSelectedSectionId(e.data.sectionId);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [liveConfig, pushToIframe]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'HIGHLIGHT_SECTION', sectionId: selectedSectionId }, '*'
    );
  }, [selectedSectionId]);

  useEffect(() => {
    themeService.getActive()
      .then(data => {
        const resolved = normalizeThemeConfig(data.config ?? {});
        setLiveConfig(resolved);
        setSavedConfig(resolved);
        setThemeId(data.id ?? null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;

    const updateScale = () => {
      const { clientWidth, clientHeight } = el;
      if (!clientWidth || !clientHeight) return;
      setPreviewScale(Math.min(clientWidth / PREVIEW_WIDTH, clientHeight / PREVIEW_HEIGHT));
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const currentSections = [...(liveConfig.pages?.[activePage]?.sections ?? [])]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const selectedSection = selectedSectionId
    ? currentSections.find(s => s.id === selectedSectionId)
    : null;

  const patchSections = (updater) => {
    setLiveConfig(prev => {
      const sections = prev.pages?.[activePage]?.sections ?? [];
      const next = typeof updater === 'function' ? updater(sections) : updater;
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [activePage]: { ...prev.pages?.[activePage], sections: next },
        },
      };
    });
    setHasChanges(true);
  };

  const reorderSections = (fromId, toId) => {
    if (!fromId || fromId === toId) return;
    patchSections(sections => {
      const sorted = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const fromIdx = sorted.findIndex(s => s.id === fromId);
      const toIdx   = sorted.findIndex(s => s.id === toId);
      if (fromIdx === -1 || toIdx === -1) return sections;
      const next = [...sorted];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next.map((s, i) => ({ ...s, order: i }));
    });
  };

  const moveSection = (sectionId, delta) => {
    patchSections(sections => {
      const sorted = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const idx = sorted.findIndex(s => s.id === sectionId);
      const target = idx + delta;
      if (idx === -1 || target < 0 || target >= sorted.length) return sections;
      const next = [...sorted];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((s, i) => ({ ...s, order: i }));
    });
  };

  const updateSectionSetting = (sectionId, key, value) => {
    patchSections(sections =>
      sections.map(s => s.id === sectionId ? { ...s, settings: { ...s.settings, [key]: value } } : s)
    );
  };

  const toggleSectionVisible = (sectionId) => {
    patchSections(sections =>
      sections.map(s => s.id === sectionId ? { ...s, visible: s.visible === false } : s)
    );
  };

  const resetSection = (sectionId) => {
    const defaultSection = DEFAULT_THEME_CONFIG.pages?.[activePage]?.sections?.find(s => s.id === sectionId);
    if (!defaultSection) return;
    patchSections(sections =>
      sections.map(s => s.id === sectionId ? structuredClone(defaultSection) : s)
    );
  };

  const updateGlobal = (group, key, value) => {
    setLiveConfig(prev => ({ ...prev, [group]: { ...prev[group], [key]: value } }));
    setHasChanges(true);
  };

  const handlePageChange = (pageKey) => {
    setActivePage(pageKey);
    setSelectedSectionId(null);
    setIframeLoading(true);
  };

  const handleIframeLoad = () => {
    setIframeLoading(false);
    setTimeout(() => pushToIframe(liveConfig), 300);
    setTimeout(() => pushToIframe(liveConfig), 800);
  };

  const handleReloadPreview = () => {
    setIframeLoading(true);
    iframeRef.current?.contentWindow?.location.reload();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const saved = await themeService.update(themeId, liveConfig);
      setThemeId(saved.id);
      if (!saved.isActive) await themeService.setActive(saved.id);
      setSavedConfig(liveConfig);
      setHasChanges(false);
      setMessage({ type: 'success', text: 'Theme saved and applied!' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to save theme' });
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    setLiveConfig(savedConfig);
    setHasChanges(false);
    setSelectedSectionId(null);
  };

  const handleResetToDefault = async () => {
    if (!window.confirm('Reset everything to factory defaults? This will overwrite the saved theme.')) return;
    try {
      setSaving(true);
      const saved = await themeService.update(themeId, DEFAULT_THEME_CONFIG);
      setThemeId(saved.id);
      if (!saved.isActive) await themeService.setActive(saved.id);
      const resolved = normalizeThemeConfig(DEFAULT_THEME_CONFIG);
      setLiveConfig(resolved);
      setSavedConfig(resolved);
      setHasChanges(false);
      setSelectedSectionId(null);
      setMessage({ type: 'success', text: 'Reset to factory defaults and saved.' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to reset theme' });
    } finally {
      setSaving(false);
    }
  };

  return {
    iframeRef,
    previewContainerRef,
    previewScale,
    liveConfig,
    hasChanges,
    activePage,
    selectedSectionId,
    setSelectedSectionId,
    dragId,
    setDragId,
    saving,
    message,
    iframeLoading,
    currentSections,
    selectedSection,
    reorderSections,
    moveSection,
    updateSectionSetting,
    toggleSectionVisible,
    resetSection,
    updateGlobal,
    handlePageChange,
    handleIframeLoad,
    handleReloadPreview,
    handleSave,
    handleRevert,
    handleResetToDefault,
  };
}
