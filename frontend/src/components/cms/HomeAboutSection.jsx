import { Link } from 'react-router-dom';
import { PageCard } from '../layout';

const JOB_TYPES = [
  { label: 'Full-time',  color: 'bg-blue-600',   desc: 'Permanent employment roles' },
  { label: 'Part-time',  color: 'bg-sky-500',    desc: 'Flexible hour positions' },
  { label: 'Internship', color: 'bg-emerald-500', desc: 'Student & graduate placements' },
  { label: 'Freelance',  color: 'bg-indigo-600',  desc: 'Project-based contract work' },
];

// Real work modes
const WORK_MODES = [
  { label: 'Remote',  color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { label: 'Hybrid',  color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { label: 'On-site', color: 'bg-amber-100 text-amber-700 border-amber-200' },
];

export default function HomeAboutSection({ sectionId }) {
  return (
    <section data-theme-section={sectionId} data-theme-label="About" className="px-4 py-24">
      <div className="max-w-5xl mx-auto">

        {/* Left: text / Right: job type cards — Stripe-style side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-5 leading-tight">
              Full-time, part-time,<br />freelance — all here.
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              HireWire handles traditional employment and freelance hiring under one roof. Post a full-time role and a project contract at the same time — from the same dashboard.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              Candidates can also switch on <span className="text-gray-900 font-medium">freelance mode</span> to make themselves discoverable for project work, without giving up their regular job search.
            </p>

            {/* Work mode tags */}
            <div className="flex gap-2 flex-wrap mb-8">
              {WORK_MODES.map((m) => (
                <span key={m.label} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${m.color}`}>
                  {m.label}
                </span>
              ))}
            </div>

            <Link
              to="/jobs"
              className="page-shell-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-blue-700 bg-white transition-all"
            >
              Browse open roles
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>
          </div>

          {/* Job type grid */}
          <div className="grid grid-cols-2 gap-3">
            {JOB_TYPES.map((type, i) => (
              <PageCard key={i} className="p-5 flex flex-col gap-2.5">
                <span className={`w-2 h-2 rounded-full ${type.color}`} />
                <p className="text-sm font-bold text-gray-900">{type.label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{type.desc}</p>
              </PageCard>
            ))}
          </div>
        </div>

        {/* Freelance deep-dive — full width, Notion-style */}
        <PageCard className="relative overflow-hidden p-8 sm:p-10">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-indigo-300/15 blur-3xl pointer-events-none" aria-hidden />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 items-center relative z-10">
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 leading-tight">
                Two ways to find freelancers.
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Open your freelance role to <span className="text-gray-900 font-medium">public bids</span> — freelancers apply with their price and timeline. Or search the pool and <span className="text-gray-900 font-medium">send direct invitations</span> to people whose profiles match what you need. Or both.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { mode: 'Public bids', detail: 'Post a role. Freelancers submit their price, delivery time, and pitch. You review and accept.' },
                { mode: 'Direct invitations', detail: 'Search freelancers by skill and location. Invite the ones you want. They accept or decline.' },
                { mode: 'Contracts', detail: 'Every accepted bid or invitation becomes a tracked contract — status, price, and chat included.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 bg-white/50 rounded-xl p-3.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.mode}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageCard>
      </div>
    </section>
  );
}
