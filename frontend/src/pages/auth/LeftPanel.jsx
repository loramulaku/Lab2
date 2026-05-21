const FEATURES = [
  'Free account forever',
  'AI-powered job matching',
  'Real-time pipeline tracking',
  'Integrated messaging',
  'Freelance bidding system',
];

export default function LeftPanel() {
  return (
    <div className="hidden lg:flex w-1/2 flex-col justify-between p-12">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-700 rounded-xl p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-10-2h4v2h-4V5z"/>
          </svg>
        </div>
        <span className="text-white font-bold text-xl">HireFlow</span>
      </div>

      {/* Heading + features */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white leading-snug">
            Join 50,000+ professionals<br />already on HireFlow
          </h1>
          <p className="text-blue-200 text-base leading-relaxed">
            Whether you're looking for your next role or building a world-class
            team, HireFlow gives you the tools to succeed.
          </p>
        </div>

        <ul className="space-y-3">
          {FEATURES.map(feature => (
            <li key={feature} className="flex items-center gap-3">
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

      {/* Security badge */}
      <div className="bg-blue-700/40 rounded-2xl p-4 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z"/>
        </svg>
        <div>
          <p className="text-white font-semibold text-sm">Secure &amp; Private</p>
          <p className="text-blue-200 text-xs mt-0.5">Your data is encrypted and never sold. We take privacy seriously.</p>
        </div>
      </div>
    </div>
  );
}
