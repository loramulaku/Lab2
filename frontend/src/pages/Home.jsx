import { usePageSections } from '../context/ThemeContext';
import { PageShell } from '../components/layout';
import HomeHeroSection       from '../components/cms/HomeHeroSection';
import HomeStatsSection      from '../components/cms/HomeStatsSection';
import HomeAboutSection      from '../components/cms/HomeAboutSection';
import HomeCategoriesSection from '../components/cms/HomeCategoriesSection';
import HomeGuideSection      from '../components/cms/HomeGuideSection';
import HomeCtaSection        from '../components/cms/HomeCtaSection';

const SECTION_RENDERERS = {
  'home-hero':       HomeHeroSection,
  'home-stats':      HomeStatsSection,
  'home-about':      HomeAboutSection,
  'home-categories': HomeCategoriesSection,
  'home-guide':      HomeGuideSection,
  'home-cta':        HomeCtaSection,
};

export default function Home() {
  const sections = usePageSections('home');

  return (
    <PageShell flush>
      <div className="flex flex-col min-h-screen">
        {sections.map((section) => {
          const Component = SECTION_RENDERERS[section.type];
          if (!Component) return null;
          return (
            <Component
              key={section.id}
              sectionId={section.id}
              settings={section.settings}
            />
          );
        })}
      </div>
    </PageShell>
  );
}
