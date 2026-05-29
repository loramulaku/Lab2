import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import siteContentService from '../services/siteContentService';
import useCmsPreviewMode from '../hooks/useCmsPreviewMode';
import { subscribeSiteContentUpdated } from '../utils/cmsEvents';
import { logError } from '../utils/safeLog';

const SiteContentContext = createContext(null);

/**
 * Single source of truth for all CMS text on a page.
 * Without this provider every CmsBlock/useSiteContent call had its own isolated
 * state, so postMessage preview updates only hit one instance and editing appeared
 * to stop working randomly.
 */
export function SiteContentProvider({ children }) {
  const isPreview = useCmsPreviewMode();
  const [map, setMap] = useState({});
  const [previewOverrides, setPreviewOverrides] = useState({});
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);

  const refresh = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const list = await siteContentService.list();
      const next = {};
      for (const item of list) next[item.key] = item.value ?? '';
      setMap(next);
    } catch (err) {
      logError('[SiteContentProvider] fetch failed:', err);
    } finally {
      if (!silent) setLoading(false);
      initialLoadDone.current = true;
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Auto-refresh public pages when content is published (any tab) or tab refocuses.
  useEffect(() => {
    if (isPreview) return undefined;

    return subscribeSiteContentUpdated(() => {
      refresh({ silent: initialLoadDone.current });
    });
  }, [refresh, isPreview]);

  // Preview iframe: receive live overrides from the theme editor parent.
  useEffect(() => {
    if (!isPreview) return undefined;

    const onMessage = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'CMS_PREVIEW') {
        setPreviewOverrides(e.data.overrides ?? {});
      }
    };

    window.addEventListener('message', onMessage);
    // Handshake — parent may have sent CMS_PREVIEW before React mounted.
    window.parent.postMessage({ type: 'CMS_PREVIEW_READY' }, window.location.origin);

    return () => window.removeEventListener('message', onMessage);
  }, [isPreview]);

  const resolve = useCallback(
    (key) => {
      if (isPreview && Object.prototype.hasOwnProperty.call(previewOverrides, key)) {
        return previewOverrides[key];
      }
      if (Object.prototype.hasOwnProperty.call(map, key)) return map[key];
      return undefined;
    },
    [isPreview, previewOverrides, map]
  );

  const t = useCallback(
    (key, fallback = '') => {
      const val = resolve(key);
      return val !== undefined && val !== null ? val : fallback;
    },
    [resolve]
  );

  const lines = useCallback(
    (key, fallback = []) => {
      const raw = resolve(key);
      if (raw !== undefined && raw !== null && raw !== '') {
        return raw.split('\n').map((s) => s.trim()).filter(Boolean);
      }
      return fallback;
    },
    [resolve]
  );

  return (
    <SiteContentContext.Provider value={{ t, lines, map, loading, refresh, isPreview }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used within <SiteContentProvider>');
  return ctx;
}

export default SiteContentContext;
