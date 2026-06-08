import { Link } from 'react-router-dom';
import { PageCard } from '../layout';

export default function HomeAboutSection({ sectionId, settings: s = {} }) {
  const title   = s.title ?? 'Full-time, part-time,\nfreelance — all here.';
  const subtitle = s.subtitle ?? null;
  const body    = s.body ?? null;
  const ctaText = s.ctaText ?? 'Browse open roles';

  const titleLines = title.split('\n');

  const jobTypes = [
    { label: s.type1Label || 'Full-time',  color: 'bg-blue-600',    desc: s.type1Desc || 'Permanent employment roles' },
    { label: s.type2Label || 'Part-time',  color: 'bg-sky-500',     desc: s.type2Desc || 'Flexible hour positions' },
    { label: s.type3Label || 'Internship', color: 'bg-emerald-500', desc: s.type3Desc || 'Student & graduate placements' },
    { label: s.type4Label || 'Freelance',  color: 'bg-indigo-600',  desc: s.type4Desc || 'Project-based contract work' },
  ];

  const workModes = [
    { label: 'Remote',  color: 'bg-sky-100 text-sky-700 border-sky-200' },
    { label: 'Hybrid',  color: 'bg-violet-100 text-violet-700 border-violet-200' },
    { label: 'On-site', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  ];

  const freelanceItems = [
    { mode: s.fl1Mode || 'Public bids',         detail: s.fl1Detail || 'Post a role. Freelancers submit their price, delivery time, and pitch. You review and accept.' },
    { mode: s.fl2Mode || 'Direct invitations',   detail: s.fl2Detail || 'Search freelancers by skill and location. Invite the ones you want. They accept or decline.' },
    { mode: s.fl3Mode || 'Contracts',            detail: s.fl3Detail || 'Every accepted bid or invitation becomes a tracked contract — status, price, and chat included.' },
  ];

  return (
    <section data-theme-section={sectionId} data-theme-label="About" className="px-4 py-24">
      <div className="max-w-5xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-5 leading-tight">
              {titleLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < titleLines.length - 1 && <br />}
                </span>
              ))}
            </h2>
            {subtitle && (
              <p className="text-gray-700 font-medium leading-relaxed mb-4">{subtitle}</p>
            )}
            {body ? (
              <p className="text-gray-500 leading-relaxed mb-8 whitespace-pre-line">{body}</p>
            ) : (
              <>
                <p className="text-gray-500 leading-relaxed mb-4">
                  HireWire handles traditional employment and freelance hiring under one roof. Post a full-time role and a project contract at the same time — from the same dashboard.
                </p>
                <p className="text-gray-500 leading-relaxed mb-8">
                  Candidates can also switch on <span className="text-gray-900 font-medium">freelance mode</span> to make themselves discoverable for project work, without giving up their regular job search.
                </p>
              </>
            )}

            <div className="flex gap-2 flex-wrap mb-8">
              {workModes.map((m) => (
                <span key={m.label} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${m.color}`}>
                  {m.label}
                </span>
              ))}
            </div>

            <Link
              to="/register"
              className="page-shell-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-blue-700 bg-white transition-all"
            >
              {ctaText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {jobTypes.map((type, i) => (
              <PageCard key={i} className="p-5 flex flex-col gap-2.5">
                <span className={`w-2 h-2 rounded-full ${type.color}`} />
                <p className="text-sm font-bold text-gray-900">{type.label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{type.desc}</p>
              </PageCard>
            ))}
          </div>
        </div>

        <PageCard className="relative overflow-hidden p-8 sm:p-10">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-indigo-300/15 blur-3xl pointer-events-none" aria-hidden />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 items-center relative z-10">
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 leading-tight">
                {s.freelanceTitle || 'Two ways to find freelancers.'}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {s.freelanceBody || 'Open your freelance role to public bids — freelancers apply with their price and timeline. Or search the pool and send direct invitations to people whose profiles match what you need. Or both.'}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {freelanceItems.map((item, i) => (
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
