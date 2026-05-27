import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

/**
 * One layout for the entire app — marketing, browse, dashboards, settings.
 * Same header, same background, same content width.
 */
export default function SiteLayout({
  children,
  showFooter = false,
  /** Skip page-container wrapper (home hero, job browse hero, etc.) */
  bare = false,
  /** Custom main className */
  mainClassName = '',
}) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="page-shell flex flex-col min-h-screen">
      <SiteHeader />
      <main
        key={location.pathname}
        className={`flex-1 animate-page-enter ${mainClassName}`}
      >
        {bare ? children : (
          <div className="page-container pt-8 pb-16">{children}</div>
        )}
      </main>
      {showFooter && <SiteFooter />}
    </div>
  );
}
