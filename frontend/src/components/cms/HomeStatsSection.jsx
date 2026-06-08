import { Link } from 'react-router-dom';
import { PageCard } from '../layout';

function FeatureItem({ title, desc }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-0.5">{title}</p>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function HomeStatsSection({ sectionId, settings: s = {} }) {
  const hasStats = s.stat1Value || s.stat2Value || s.stat3Value || s.stat4Value;
  const stats = [
    { value: s.stat1Value ?? '—', label: s.stat1Label ?? '' },
    { value: s.stat2Value ?? '—', label: s.stat2Label ?? '' },
    { value: s.stat3Value ?? '—', label: s.stat3Label ?? '' },
    { value: s.stat4Value ?? '—', label: s.stat4Label ?? '' },
  ];

  const candidateFeatures = [
    { title: s.cand1Title || 'One profile, every job',       desc: s.cand1Desc || 'Upload your CV, list your skills and experience, and apply to any listing in one click — your profile does the talking.' },
    { title: s.cand2Title || 'Filter by what matters',       desc: s.cand2Desc || 'Sort by job type, work mode (remote, hybrid, on-site), salary, experience level, or category.' },
    { title: s.cand3Title || 'Save & track applications',    desc: s.cand3Desc || "Bookmark roles you're eyeing. See the status of every application you've submitted in one dashboard." },
    { title: s.cand4Title || 'Freelance mode',               desc: s.cand4Desc || 'Toggle on freelance availability. Submit bids on project-based roles or accept direct invitations from recruiters.' },
  ];

  const recruiterFeatures = [
    { title: s.rec1Title || 'Post full-time or freelance roles',        desc: s.rec1Desc || 'Create listings for employment and project-based work. Set budgets, hiring mode, and visibility in minutes.' },
    { title: s.rec2Title || 'Two ways to hire freelancers',             desc: s.rec2Desc || 'Open your role to public bids, or search and invite specific freelancers directly — or do both.' },
    { title: s.rec3Title || 'Manage applicants & schedule interviews',  desc: s.rec3Desc || 'Review applications, update statuses, and schedule interview times straight from your dashboard.' },
    { title: s.rec4Title || 'Contracts & billing',                      desc: s.rec4Desc || 'Accepted bids and invitations become tracked contracts. Subscription plans control how many roles you can post.' },
  ];

  return (
    <section data-theme-section={sectionId} data-theme-label="Features" className="px-4 py-24">
      <div className="max-w-5xl mx-auto">

        {hasStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-black text-blue-600">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
            {s.title || 'Built for candidates. Built for recruiters.'}
          </h2>
          <p className="text-gray-500 text-sm mt-3">
            {s.subtitle || "Everything you need on whichever side of hiring you're on."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Candidates */}
          <PageCard className="p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3 pb-4 border-b border-blue-100/60">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900">{s.candCardTitle || 'For Candidates'}</p>
                <p className="text-xs text-gray-400">{s.candCardSub || 'Looking for your next role'}</p>
              </div>
              <Link to="/register" className="ml-auto text-xs text-blue-600 font-medium hover:underline whitespace-nowrap">
                {s.candCtaText || 'Sign up free →'}
              </Link>
            </div>
            <div className="flex flex-col gap-5">
              {candidateFeatures.map((f, i) => <FeatureItem key={i} {...f} />)}
            </div>
          </PageCard>

          {/* Recruiters */}
          <PageCard className="p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3 pb-4 border-b border-blue-100/60">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5v-2h2v2zm4 4H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V5h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V5h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900">{s.recCardTitle || 'For Recruiters'}</p>
                <p className="text-xs text-gray-400">{s.recCardSub || 'Building your team'}</p>
              </div>
              <Link to="/register" className="ml-auto text-xs text-indigo-600 font-medium hover:underline whitespace-nowrap">
                {s.recCtaText || 'Start posting →'}
              </Link>
            </div>
            <div className="flex flex-col gap-5">
              {recruiterFeatures.map((f, i) => <FeatureItem key={i} {...f} />)}
            </div>
          </PageCard>
        </div>
      </div>
    </section>
  );
}
