import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/** True when the page is rendered inside the admin visual editor iframe. */
export default function useCmsPreviewMode() {
  const [params] = useSearchParams();
  return useMemo(() => params.get('cmsPreview') === '1', [params]);
}
