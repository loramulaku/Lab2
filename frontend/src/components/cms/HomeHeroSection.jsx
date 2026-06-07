import { Link } from 'react-router-dom';

export default function HomeHeroSection({ sectionId, settings: s = {} }) {
  const btn1Text = s.btn1Text ?? 'Browse Jobs';
  const btn2Text = s.btn2Text ?? 'Create Account';

  return (
    <section
      data-theme-section={sectionId}
      data-theme-label="Hero"
      className="relative flex flex-col items-center justify-center px-4 pt-36 pb-32 overflow-hidden min-h-screen"
    >
      {/* Light background wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(239,246,255,0.6) 0%, rgba(255,255,255,0) 60%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <p className="text-sm font-medium text-blue-600 mb-5 tracking-wide">
          Jobs &amp; freelance work in one place
        </p>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 leading-[1.04] tracking-tight mb-6">
          Find work.<br />
          <span className="text-blue-600">Hire talent.</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
          {s.subtitle ?? 'Browse job listings, apply with one click, post roles, and manage applicants or freelancers — from the same account.'}
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/jobs"
            className="page-shell-btn inline-flex items-center gap-2 px-8 py-3.5 font-semibold rounded-xl text-white text-sm bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {btn1Text}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
          <Link
            to="/register"
            className="page-shell-btn inline-flex items-center gap-2 px-8 py-3.5 font-semibold rounded-xl bg-white/80 text-gray-700 text-sm border border-gray-200 hover:border-gray-300 transition-colors"
          >
            {btn2Text}
          </Link>
        </div>
      </div>
    </section>
  );
}
