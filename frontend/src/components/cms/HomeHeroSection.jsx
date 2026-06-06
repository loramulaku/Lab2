import { Link } from 'react-router-dom';
import { PageCard } from '../layout';

export default function HomeHeroSection({ sectionId, settings: s = {} }) {
  const accentFrom    = s.bgFrom        ?? '#2563eb';
  const accentTo      = s.bgTo          ?? '#3b82f6';
  const title         = s.title         ?? 'Welcome to HireWire';
  const subtitle      = s.subtitle      ?? 'Job Portal & Recruitment Platform';
  const btn1Text      = s.btn1Text      ?? 'Browse Jobs';
  const btn1BgColor   = s.btn1BgColor   ?? '#2563eb';
  const btn1TextColor = s.btn1TextColor ?? '#ffffff';
  const btn2Text      = s.btn2Text      ?? 'Create Account';
  const btn2BgColor   = s.btn2BgColor   ?? '#ffffff';
  const btn2TextColor = s.btn2TextColor ?? '#2563eb';

  return (
    <section
      data-theme-section={sectionId}
      data-theme-label="Hero"
      className="relative flex flex-col items-center justify-center px-4 pt-28 pb-16 min-h-[calc(100vh-4rem)]"
    >
      {/* CMS accent — subtle glow, does not cover the page background */}
      <div
        className="absolute top-24 left-1/2 -translate-x-1/2 w-[min(720px,90vw)] h-72 rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        aria-hidden
      />

      <PageCard className="relative max-w-4xl w-full p-10 sm:p-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
          {title}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8">{subtitle}</p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/jobs"
            className="page-shell-btn px-8 py-3 font-semibold rounded-lg transition-all"
            style={{ backgroundColor: btn1BgColor, color: btn1TextColor }}
          >
            {btn1Text}
          </Link>
          <Link
            to="/register"
            className="page-shell-btn px-8 py-3 font-semibold rounded-lg transition-all"
            style={{ backgroundColor: btn2BgColor, color: btn2TextColor }}
          >
            {btn2Text}
          </Link>
        </div>
      </PageCard>
    </section>
  );
}
