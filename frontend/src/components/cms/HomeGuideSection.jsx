import { PageCard } from '../layout';

export default function HomeGuideSection({ sectionId, settings: s = {} }) {
  const guideTitle = s.guideTitle ?? 'Quick Start Guide';
  const step1      = s.step1      ?? 'Create an account as a candidate or recruiter.';
  const step2      = s.step2      ?? 'Complete your profile to unlock all features.';
  const step3      = s.step3      ?? 'Browse jobs, apply, or post openings from your dashboard.';
  const steps = [step1, step2, step3].filter(Boolean);

  return (
    <section data-theme-section={sectionId} data-theme-label="Guide" className="px-4 py-12">
      <PageCard className="max-w-2xl mx-auto p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{guideTitle}</h2>
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-700">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="leading-relaxed pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </PageCard>
    </section>
  );
}
