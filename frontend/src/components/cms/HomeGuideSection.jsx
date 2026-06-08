import { Link } from 'react-router-dom';
import { PageCard } from '../layout';

const DEFAULT_CANDIDATE_STEPS = [
  { step: '1', title: 'Create your profile', detail: 'Add your skills, experience, education, and upload your CV. Recruiters search by all of this.' },
  { step: '2', title: 'Browse & filter jobs', detail: 'Filter by type, work mode, salary, experience level, and location. Save the ones worth coming back to.' },
  { step: '3', title: 'Apply in one click', detail: 'Your profile is your application. Track every submission from your personal dashboard.' },
];

const DEFAULT_RECRUITER_STEPS = [
  { step: '1', title: 'Set up your company', detail: 'Add your company name, logo, and details. Takes two minutes.' },
  { step: '2', title: 'Post your role', detail: 'Choose employment type, work mode, salary range, and requirements. Standard job or freelance project — your call.' },
  { step: '3', title: 'Review & hire', detail: 'Manage applicants, schedule interviews, review bids, or invite freelancers directly. Accepted hires become tracked contracts.' },
];

function StepList({ steps }) {
  return (
    <div className="flex flex-col gap-5">
      {steps.map((s, i) => (
        <div key={i} className="flex gap-4">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
            {s.step}
          </div>
          <div>
            {s.title && <p className="text-sm font-semibold text-gray-900 mb-0.5">{s.title}</p>}
            <p className="text-xs text-gray-500 leading-relaxed">{s.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}


export default function HomeGuideSection({ sectionId, settings: s = {} }) {
  const candidateSteps = [
    { step: '1', title: s.cand1Title || DEFAULT_CANDIDATE_STEPS[0].title, detail: s.cand1Body || DEFAULT_CANDIDATE_STEPS[0].detail },
    { step: '2', title: s.cand2Title || DEFAULT_CANDIDATE_STEPS[1].title, detail: s.cand2Body || DEFAULT_CANDIDATE_STEPS[1].detail },
    { step: '3', title: s.cand3Title || DEFAULT_CANDIDATE_STEPS[2].title, detail: s.cand3Body || DEFAULT_CANDIDATE_STEPS[2].detail },
  ];
  const recruiterSteps = [
    { step: '1', title: s.rec1Title || DEFAULT_RECRUITER_STEPS[0].title, detail: s.rec1Body || DEFAULT_RECRUITER_STEPS[0].detail },
    { step: '2', title: s.rec2Title || DEFAULT_RECRUITER_STEPS[1].title, detail: s.rec2Body || DEFAULT_RECRUITER_STEPS[1].detail },
    { step: '3', title: s.rec3Title || DEFAULT_RECRUITER_STEPS[2].title, detail: s.rec3Body || DEFAULT_RECRUITER_STEPS[2].detail },
  ];

  return (
    <section data-theme-section={sectionId} data-theme-label="Guide" className="px-4 py-24">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
            {s.guideTitle ?? 'From zero to hired.'}
          </h2>
          <p className="text-gray-500 mt-3 max-w-sm mx-auto text-sm">
            {s.guideSub ?? "Here's exactly how it works — no surprises."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PageCard className="p-7 flex flex-col gap-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-blue-100/60">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-900">{s.candLabel || 'As a candidate'}</p>
            </div>
            <StepList steps={candidateSteps} />
            <Link to="/register" className="page-shell-btn self-start inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-blue-700 bg-white mt-auto transition-all">
              {s.candCtaText || 'Create candidate account →'}
            </Link>
          </PageCard>

          {recruiterSteps && (
            <PageCard className="p-7 flex flex-col gap-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-blue-100/60">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-900">{s.recLabel || 'As a recruiter'}</p>
              </div>
              <StepList steps={recruiterSteps} />
              <Link to="/register" className="page-shell-btn self-start inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-indigo-700 bg-white mt-auto transition-all">
                {s.recCtaText || 'Create recruiter account →'}
              </Link>
            </PageCard>
          )}
        </div>
      </div>
    </section>
  );
}
