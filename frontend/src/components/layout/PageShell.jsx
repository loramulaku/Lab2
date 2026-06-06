import Header from '../Header';
import PageBackground from './PageBackground';
import PageHeading from './PageHeading';

const WIDTH = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
};

/**
 * Shared shell for routes that use the global Header.
 *
 * Props:
 *   width   — 'sm' | 'md' | 'lg'  (default 'md')
 *   flush   — skip inner container; page controls its own layout (e.g. Jobs)
 *   loading — show centred loading state
 */
export default function PageShell({
  title,
  subtitle,
  children,
  width = 'md',
  loading = false,
  loadingMessage = 'Loading…',
  flush = false,
  className = '',
  mainClassName = '',
}) {
  const maxWidth = WIDTH[width] ?? WIDTH.md;

  return (
    <div className={`min-h-screen relative ${className}`}>
      <PageBackground />
      <Header />

      {loading ? (
        <div className="flex items-center justify-center pt-32 text-gray-400 text-sm">
          {loadingMessage}
        </div>
      ) : flush ? (
        <main className={mainClassName}>{children}</main>
      ) : (
        <main className={`${maxWidth} mx-auto px-4 sm:px-6 pt-24 pb-10 ${mainClassName}`}>
          <PageHeading title={title} subtitle={subtitle} />
          {children}
        </main>
      )}
    </div>
  );
}
