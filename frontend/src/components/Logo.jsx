import { Link } from 'react-router-dom';

// ── Shared brand mark ───────────────────────────────────────────────────────
// One canonical HireWire logo used by every shell (public header, recruiter
// sidebar, admin sidebar) so the brand reads identically across the app.
//
//   <Logo />                              → links to "/", default size
//   <Logo to="/recruiter/dashboard" badge="Recruiter" />
//   <Logo to="/admin" badge="Admin" onDark />   (dark sidebars)
//   <Logo label={siteName} />             → CMS-overridable wordmark (public site)

const SIZES = {
  sm: { box: 'p-1.5', icon: 'w-4 h-4', text: 'text-base' },
  md: { box: 'p-1.5', icon: 'w-5 h-5', text: 'text-lg' },
  lg: { box: 'p-2',   icon: 'w-6 h-6', text: 'text-2xl' },
};

function BriefcaseGlyph({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-10-2h4v2h-4V5z" />
    </svg>
  );
}

export default function Logo({
  to = '/',
  size = 'md',
  label,            // optional wordmark override (e.g. CMS siteName)
  badge,            // optional small badge text (e.g. "Recruiter", "Admin")
  onDark = false,   // white wordmark for dark sidebars
  className = '',
}) {
  const s = SIZES[size] ?? SIZES.md;

  const content = (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className={`flex items-center justify-center bg-blue-600 text-white rounded-xl ${s.box} group-hover:bg-blue-500 transition-colors`}>
        <BriefcaseGlyph className={s.icon} />
      </span>
      <span className={`font-bold tracking-tight leading-none ${s.text} ${onDark ? 'text-white' : 'text-gray-900'}`}>
        {label || <>Hire<span className={onDark ? 'text-blue-400' : 'text-blue-600'}>Wire</span></>}
      </span>
      {badge && (
        <span className={`text-[11px] font-medium rounded px-1.5 py-0.5 leading-none ${
          onDark ? 'text-blue-300 bg-white/10' : 'text-blue-500 bg-blue-50'
        }`}>
          {badge}
        </span>
      )}
    </span>
  );

  if (!to) return content;
  return (
    <Link to={to} className="group flex items-center w-fit flex-shrink-0 hover:opacity-95 transition-opacity">
      {content}
    </Link>
  );
}
