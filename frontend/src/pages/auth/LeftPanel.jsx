import BrandLogo from '../../components/BrandLogo';
import CmsBlock from '../../components/cms/CmsBlock';
import useSiteContent from '../../hooks/useSiteContent';

const DEFAULT_FEATURES = [
  'Free account forever',
  'AI-powered job matching',
  'Real-time pipeline tracking',
  'Integrated messaging',
  'Freelance bidding system',
];

export default function LeftPanel() {
  const { lines } = useSiteContent();
  const features = lines('auth.left.features', DEFAULT_FEATURES);

  return (
    <div className="hidden lg:flex w-1/2 flex-col justify-between p-12">
      <BrandLogo variant="light" />

      <div className="space-y-8">
        <div className="space-y-4">
          <CmsBlock
            cmsKey="auth.left.hero.title"
            fallback={'Join 50,000+ professionals\nalready on HireFlow'}
            as="h1"
            className="text-4xl font-bold text-white leading-snug"
            multiline
          />
          <CmsBlock
            cmsKey="auth.left.hero.subtitle"
            fallback="Whether you're looking for your next role or building a world-class team, HireFlow gives you the tools to succeed."
            as="p"
            className="text-blue-200 text-base leading-relaxed"
          />
        </div>

        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </span>
              <span className="text-white text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-blue-700/40 rounded-2xl p-4 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z"/>
        </svg>
        <div>
          <CmsBlock cmsKey="auth.left.security.title" fallback="Secure & Private" as="p" className="text-white font-semibold text-sm" />
          <CmsBlock
            cmsKey="auth.left.security.text"
            fallback="Your data is encrypted and never sold. We take privacy seriously."
            as="p"
            className="text-blue-200 text-xs mt-0.5"
          />
        </div>
      </div>
    </div>
  );
}
