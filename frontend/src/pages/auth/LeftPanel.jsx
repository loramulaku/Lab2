import { Link } from 'react-router-dom';
import { usePageSection } from '../../context/ThemeContext';

// Convert a CMS hex color into a translucent rgba so the panel reads as frosted
// glass over the page background. Non-hex values are returned untouched.
function glassyBg(color, alpha = 0.85) {
  const m = /^#?([a-f\d]{3}|[a-f\d]{6})$/i.exec((color ?? '').trim());
  if (!m) return color;
  let h = m[1];
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export default function LeftPanel({
  sectionId = 'login-left',
  pageName  = 'login',
  bgColor:  bgColorProp,
  heading:  headingProp,
  subtext:  subtextProp,
}) {
  const s = usePageSection(pageName, sectionId);

  const bgColor = bgColorProp ?? s.bgColor ?? '#2B3FE7';
  const heading = headingProp ?? s.heading ?? 'Find work.\nHire better.\nAll in one place.';
  const subtext = subtextProp ?? s.subtext ?? 'Browse listings, apply with one click, post roles, and manage your entire hiring pipeline — all from a single account.';

  const features = [
    s.feat1 || 'Free account forever',
    s.feat2 || 'One-click job applications',
    s.feat3 || 'Real-time pipeline tracking',
    s.feat4 || 'Integrated messaging',
    s.feat5 || 'Freelance bidding system',
  ];

  return (
    <aside
      data-theme-section={sectionId}
      data-theme-label="Left Panel"
      className="auth-left-panel page-shell-card hidden lg:flex w-1/2 flex-col justify-between p-12"
      style={{ background: 'rgba(255, 255, 255, 0.12)' }}
    >
      <Link to="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
        <div className="rounded-xl p-2" style={{ backgroundColor: bgColor }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-10-2h4v2h-4V5z"/>
          </svg>
        </div>
        <span className="text-gray-900 font-bold text-xl">HireWire</span>
      </Link>

      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-gray-900 leading-tight tracking-tight whitespace-pre-line">
            {heading}
          </h1>
          <p className="text-gray-500 text-base leading-relaxed">{subtext}</p>
        </div>

        <ul className="space-y-3">
          {features.map(feature => (
            <li key={feature} className="flex items-center gap-3">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: glassyBg(bgColor, 0.15) }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" style={{ color: bgColor }}>
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </span>
              <span className="text-gray-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-blue-300/40 pt-4">
        <p className="text-gray-500 text-xs">
          Already have an account?{' '}
          <a href="/login" className="font-medium hover:underline" style={{ color: bgColor }}>Sign in here</a>
        </p>
      </div>
    </aside>
  );
}
