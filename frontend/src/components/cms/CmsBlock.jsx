import { createElement, useEffect, useState } from 'react';
import useSiteContent from '../../hooks/useSiteContent';
import useCmsPreviewMode from '../../hooks/useCmsPreviewMode';

/**
 * CmsBlock — renders CMS text and, in preview mode, highlights on hover and
 * notifies the admin editor when clicked (Shopify-style click-to-edit).
 */
export default function CmsBlock({
  cmsKey,
  fallback = '',
  as: Tag = 'span',
  className = '',
  multiline = false,
}) {
  const { t } = useSiteContent();
  const isPreview = useCmsPreviewMode();
  const [focused, setFocused] = useState(false);
  const value = t(cmsKey, fallback);

  useEffect(() => {
    if (!isPreview) return undefined;
    const onMessage = (e) => {
      if (e.data?.type === 'CMS_FOCUS') setFocused(e.data.key === cmsKey);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [isPreview, cmsKey]);

  const handleClick = (e) => {
    if (!isPreview) return;
    e.preventDefault();
    e.stopPropagation();
    window.parent.postMessage({ type: 'CMS_FOCUS', key: cmsKey }, '*');
  };

  const previewCls = isPreview
    ? `cms-editable${focused ? ' cms-focused' : ''}`
    : '';

  return createElement(
    Tag,
    {
      'data-cms-key': cmsKey,
      onClick: handleClick,
      className: [className, previewCls].filter(Boolean).join(' ') || undefined,
      ...(multiline ? { style: { whiteSpace: 'pre-line' } } : {}),
    },
    value
  );
}
