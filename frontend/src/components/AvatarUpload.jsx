import { useRef } from 'react';

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
  </svg>
);

const UserCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-gray-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </svg>
);

/**
 * AvatarUpload — shared upload widget used on both the candidate profile
 * page and the recruiter company setup page.
 *
 * Props
 * ─────
 * src          {string|null}  Preview URL
 * onUpload     {Function}     Called with the selected File
 * size         'md'|'lg'      Controls the preview box dimensions (default 'md' = w-20 h-20)
 *
 * layout       'overlay'|'inline'
 *   'overlay'  (default) — circular image with a pencil button overlaid at bottom-right.
 *              Used in the candidate profile header.
 *   'inline'   — image box on the left, labelled upload button + hint text on the right.
 *              Used in form sections (logo picker, profile-photo picker in company setup).
 *
 * Props only used with layout='inline':
 *   shape        'circle'|'square'   Preview shape (default 'circle')
 *   label        string              Fallback text inside the empty preview box
 *   buttonLabel  string              Text on the upload button (default 'Upload')
 *   hint         string              Small helper text shown below the button
 */
export default function AvatarUpload({
  src,
  onUpload,
  size        = 'md',
  layout      = 'overlay',
  shape       = 'circle',
  label       = null,
  buttonLabel = 'Upload',
  hint        = null,
}) {
  const fileRef = useRef();
  const dim     = size === 'lg' ? 'w-24 h-24' : 'w-20 h-20';

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  /* ── Inline layout ─────────────────────────────────────────────────────── */
  if (layout === 'inline') {
    const shapeClass = shape === 'square' ? '' : 'rounded-full';
    const objectFit  = shape === 'square' ? 'object-contain' : 'object-cover';

    return (
      <div className="flex items-center gap-4 mb-6">
        <div className={`${dim} ${shapeClass} border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0`}>
          {src
            ? <img src={src} alt="preview" className={`w-full h-full ${objectFit}`} />
            : <span className="text-xs text-gray-400 text-center leading-tight px-1">{label}</span>}
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="border border-gray-300 text-gray-700 text-sm px-4 py-2 hover:bg-gray-50 transition rounded-none"
          >
            {buttonLabel}
          </button>
          {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </div>
    );
  }

  /* ── Overlay layout (default) ──────────────────────────────────────────── */
  return (
    <div className="relative flex-shrink-0">
      <div className={`${dim} rounded-full bg-gray-100 overflow-hidden`}>
        {src
          ? <img src={src} alt="avatar" className="w-full h-full object-cover" />
          : <UserCircleIcon />}
      </div>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700"
      >
        <PencilIcon />
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  );
}
