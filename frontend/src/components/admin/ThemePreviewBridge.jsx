import { useEffect } from 'react';

let labelEl = null;

function ensureLabel() {
  if (!labelEl) {
    labelEl = document.createElement('div');
    labelEl.id = 'theme-preview-label';
    document.body.appendChild(labelEl);
  }
  return labelEl;
}

function positionLabel(sectionEl, text) {
  const el = ensureLabel();
  if (!sectionEl || !text) {
    el.style.display = 'none';
    return;
  }
  const rect = sectionEl.getBoundingClientRect();
  el.textContent = text;
  el.style.display = 'block';
  el.style.top  = `${Math.max(4, rect.top + 4)}px`;
  el.style.left = `${Math.max(4, rect.left + 4)}px`;
}

/**
 * Activates when the app runs inside the ThemeEditor iframe:
 * click-to-select, hover outlines, blocks navigation in preview.
 */
export default function ThemePreviewBridge() {
  const inIframe = window !== window.top;

  useEffect(() => {
    if (!inIframe) return;

    document.documentElement.classList.add('theme-editor-preview');
    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');

    const handleMouseMove = (e) => {
      const sectionEl = e.target.closest('[data-theme-section]');
      document.querySelectorAll('[data-theme-section]').forEach(el => {
        el.classList.toggle('theme-preview-hover', el === sectionEl);
      });
      if (sectionEl) {
        positionLabel(sectionEl, sectionEl.dataset.themeLabel || sectionEl.dataset.themeSection);
      } else {
        positionLabel(null);
      }
    };

    const handleClick = (e) => {
      const anchor = e.target.closest('a');
      if (anchor) {
        e.preventDefault();
        e.stopPropagation();
      }
      const submitBtn = e.target.closest('button[type="submit"], input[type="submit"]');
      if (submitBtn) {
        e.preventDefault();
        e.stopPropagation();
      }

      const sectionEl = e.target.closest('[data-theme-section]');
      if (sectionEl) {
        e.preventDefault();
        e.stopPropagation();
        window.parent.postMessage(
          { type: 'SECTION_CLICKED', sectionId: sectionEl.dataset.themeSection },
          '*'
        );
      }
    };

    const handleMessage = (e) => {
      if (e.data?.type !== 'HIGHLIGHT_SECTION') return;

      document.querySelectorAll('[data-theme-section]').forEach(el => {
        el.classList.remove('theme-preview-selected');
      });

      if (e.data.sectionId) {
        const target = document.querySelector(`[data-theme-section="${e.data.sectionId}"]`);
        if (target) {
          target.classList.add('theme-preview-selected');
          target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          positionLabel(target, target.dataset.themeLabel || target.dataset.themeSection);
        }
      } else {
        positionLabel(null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    window.addEventListener('message', handleMessage);

    return () => {
      document.documentElement.classList.remove('theme-editor-preview');
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('message', handleMessage);
      labelEl?.remove();
      labelEl = null;
    };
  }, [inIframe]);

  return null;
}
