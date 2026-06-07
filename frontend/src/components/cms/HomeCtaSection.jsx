import { Link } from 'react-router-dom';

export default function HomeCtaSection({ sectionId }) {
  return (
    <section data-theme-section={sectionId} data-theme-label="CTA" className="px-4 py-24">
      <div className="max-w-3xl mx-auto text-center">

        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-5">
          Your next hire — or your next job — starts here.
        </h2>

        <p className="text-gray-500 text-base mb-10 max-w-md mx-auto leading-relaxed">
          Free to sign up. No credit card required to browse listings or build your profile.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/register"
            className="page-shell-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-blue-600 transition-all"
          >
            Get started
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </Link>
          <Link
            to="/jobs"
            className="page-shell-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-gray-700 bg-white/80 transition-all"
          >
            Browse jobs first
          </Link>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
