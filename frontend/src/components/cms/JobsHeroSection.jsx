export default function JobsHeroSection({ settings: s = {} }) {
  const title    = s.title    ?? 'Find Your Next Opportunity';
  const subtitle = s.subtitle ?? 'Browse hundreds of roles across every industry. Filter by location, type, and skill — apply in seconds.';
  const bgFrom   = s.bgFrom   ?? '#2563eb';
  const bgTo     = s.bgTo     ?? '#4f46e5';

  return (
    <section
      data-theme-section="jobs-hero"
      data-theme-label="Jobs Hero"
      className="w-full py-12 px-6 text-center"
      style={{ background: `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)` }}
    >
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-snug mb-3">
          {title}
        </h1>
        <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
