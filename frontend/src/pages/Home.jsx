import { usePageSections } from '../context/ThemeContext';
import { PageShell } from '../components/layout';
import HomeHeroSection from '../components/cms/HomeHeroSection';
import HomeGuideSection from '../components/cms/HomeGuideSection';

const SECTION_RENDERERS = {
  'home-hero':  HomeHeroSection,
  'home-guide': HomeGuideSection,
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
