import { Link } from 'react-router-dom';

export default function HomeHeroSection({ sectionId, settings: s = {} }) {
  const bgFrom        = s.bgFrom        ?? '#7c3aed';
  const bgTo          = s.bgTo          ?? '#ec4899';
  const title         = s.title         ?? 'Welcome to HireWire';
  const subtitle      = s.subtitle      ?? 'Job Portal & Recruitment Platform';
  const btn1Text      = s.btn1Text      ?? 'Admin Login';
  const btn1BgColor   = s.btn1BgColor   ?? '#ffffff';
  const btn1TextColor = s.btn1TextColor ?? '#7c3aed';
  const btn2Text      = s.btn2Text      ?? 'Create Account';
  const btn2BgColor   = s.btn2BgColor   ?? '#6d28d9';
  const btn2TextColor = s.btn2TextColor ?? '#ffffff';

  return (
    <section
      data-theme-section={sectionId}
      data-theme-label="Hero"
      className="flex flex-col items-center justify-center px-4 py-20 flex-1"
      style={{ background: `linear-gradient(to bottom right, ${bgFrom}, ${bgTo})` }}
    >
      <div className="max-w-4xl w-full text-center text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">{title}</h1>
        <p className="text-xl md:text-2xl mb-8 opacity-95">{subtitle}</p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/login"
            className="px-8 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            style={{ backgroundColor: btn1BgColor, color: btn1TextColor }}
          >
            {btn1Text}
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            style={{ backgroundColor: btn2BgColor, color: btn2TextColor }}
          >
            {btn2Text}
          </Link>
        </div>
      </div>
    </section>
  );
}
