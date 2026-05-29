const CHANNEL_NAME = 'hireflow-site-content';

/** Notify all open tabs that published CMS content changed. */
export function notifySiteContentUpdated() {
  window.dispatchEvent(new CustomEvent('siteContent:updated'));

  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: 'siteContent:updated', at: Date.now() });
    channel.close();
  } catch {
    // BroadcastChannel unavailable — same-tab event still works.
  }
}

/**
 * Subscribe to CMS publish events (same tab and other open tabs).
 * Returns an unsubscribe function.
 */
export function subscribeSiteContentUpdated(onUpdate) {
  const handleUpdate = () => onUpdate();

  window.addEventListener('siteContent:updated', handleUpdate);

  let channel;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event.data?.type === 'siteContent:updated') handleUpdate();
    };
  } catch {
    // Ignore — same-tab events still work.
  }

  return () => {
    window.removeEventListener('siteContent:updated', handleUpdate);
    channel?.close();
  };
}
