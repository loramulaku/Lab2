import { Link } from 'react-router-dom';
import { PageCard } from '../layout';

export default function HomeCategoriesSection({ sectionId, settings: s = {} }) {
  const title    = s.title    ?? 'How do you want to work?';
  const subtitle = s.subtitle ?? 'Filter by work mode when you browse.';

  const workModeCards = [
    {
      label:  'Remote',
      href:   '/jobs',
      desc:   s.remoteDesc || 'Work from anywhere. Filter by remote-only listings across all job types.',
      dot:    'bg-sky-500',
      accent: 'group-hover:text-sky-600',
      glow:   'group-hover:bg-sky-50/60',
    },
    {
      label:  'Hybrid',
      href:   '/jobs',
      desc:   s.hybridDesc || 'Split your week. Office time with flexibility built in.',
      dot:    'bg-violet-500',
      accent: 'group-hover:text-violet-600',
      glow:   'group-hover:bg-violet-50/60',
    },
    {
      label:  'On-site',
      href:   '/jobs',
      desc:   s.onsiteDesc || 'In-person, full-time presence. Search roles at physical locations.',
      dot:    'bg-amber-500',
      accent: 'group-hover:text-amber-600',
      glow:   'group-hover:bg-amber-50/60',
    },
    {
      label:  'Freelance',
      href:   '/jobs',
      desc:   s.freelanceDesc || 'Project-based work. Set your own price and timeline.',
      dot:    'bg-indigo-500',
      accent: 'group-hover:text-indigo-600',
      glow:   'group-hover:bg-indigo-50/60',
    },
  ];

  const expLevels = [
    { label: s.exp1Label || 'Entry Level', href: '/jobs', tag: s.exp1Tag || 'No experience required' },
    { label: s.exp2Label || 'Mid Level',   href: '/jobs', tag: s.exp2Tag || '2–5 years'              },
    { label: s.exp3Label || 'Senior',      href: '/jobs', tag: s.exp3Tag || '5+ years'               },
    { label: s.exp4Label || 'Internship',  href: '/jobs', tag: s.exp4Tag || 'Students & graduates'   },
  ];

  return (
    <section data-theme-section={sectionId} data-theme-label="Explore" className="px-4 py-24">
      <div className="max-w-5xl mx-auto">

        <div className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
            </div>
            <Link to="/jobs" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
              {s.allListingsText || 'All listings →'}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {workModeCards.map((card, i) => (
              <Link key={i} to={card.href} className="group">
                <PageCard className={`p-5 flex flex-col gap-3 h-full transition-colors duration-150 ${card.glow}`}>
                  <span className={`w-2 h-2 rounded-full ${card.dot}`} />
                  <div>
                    <p className={`text-sm font-bold text-gray-900 transition-colors duration-150 ${card.accent}`}>{card.label}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{card.desc}</p>
                  </div>
                </PageCard>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 block mb-6">
            {s.expHeading || 'Browse by experience level'}
          </p>
          <PageCard className="grid grid-cols-2 sm:grid-cols-4 overflow-hidden">
            {expLevels.map((lvl, i) => (
              <Link
                key={i}
                to={lvl.href}
                className={`group flex flex-col gap-1 p-5 hover:bg-blue-50/40 transition-colors ${i < expLevels.length - 1 ? 'border-r border-blue-100/50' : ''}`}
              >
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{lvl.label}</p>
                <p className="text-xs text-gray-400">{lvl.tag}</p>
              </Link>
            ))}
          </PageCard>
        </div>
      </div>
    </section>
  );
}
