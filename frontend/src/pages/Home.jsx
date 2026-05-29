import { usePageSections } from '../context/ThemeContext';
import HomeHeroSection from '../components/cms/HomeHeroSection';
import HomeGuideSection from '../components/cms/HomeGuideSection';

const SECTION_RENDERERS = {
  'home-hero':  HomeHeroSection,
  'home-guide': HomeGuideSection,
};

export default function Home() {
  const sections = usePageSections('home');

  return (
    <div className="min-h-screen flex flex-col">
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
  );
}
