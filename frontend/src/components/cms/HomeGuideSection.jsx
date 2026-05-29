export default function HomeGuideSection({ sectionId, settings: s = {} }) {
  const guideTitle = s.guideTitle ?? 'Quick Start Guide';
  const step1      = s.step1      ?? 'Register a new account or use: admin@hireflow.com / admin123';
  const step2      = s.step2      ?? 'Assign admin role in MySQL Workbench (see SQL file in backend folder)';
  const step3      = s.step3      ?? 'Login and navigate to /admin to access the admin dashboard';
  const bgColor    = s.bgColor    ?? '#ffffff';
  const textColor  = s.textColor  ?? '#ffffff';
  const cardOpacity = s.cardOpacity ?? '20';

  const steps = [step1, step2, step3].filter(Boolean);

  return (
    <section
      data-theme-section={sectionId}
      data-theme-label="Guide"
      className="px-4 py-12"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div
        className="max-w-2xl mx-auto p-6 rounded-lg backdrop-blur-lg"
        style={{ backgroundColor: `${textColor}${cardOpacity}` }}
      >
        <h2 className="text-2xl font-bold mb-4">{guideTitle}</h2>
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="font-bold flex-shrink-0">{i + 1}.</span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
