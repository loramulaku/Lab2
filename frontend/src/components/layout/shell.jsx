import Header from '../Header';

const WIDTH = { sm: 'max-w-3xl', md: 'max-w-5xl', lg: 'max-w-7xl' };

const ALERT_VARIANTS = {
  error:   'border-red-200 bg-red-50 text-red-600',
  success: 'border-green-200 bg-green-50 text-green-700',
  info:    'border-blue-200 bg-blue-50 text-blue-700',
};

export function PageBackground({ scoped = false }) {
  const position = scoped ? 'absolute' : 'fixed';
  return (
    <div className={`pointer-events-none ${position} inset-0 z-0 overflow-hidden`} aria-hidden>
      <div className="absolute inset-0 page-shell-bg" />
      <div className="absolute -top-48 -right-32 h-[32rem] w-[32rem] rounded-full bg-blue-300/30 blur-3xl" />
      <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-indigo-200/35 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-sky-200/25 blur-3xl" />
    </div>
  );
}

function PageHeading({ title, subtitle }) {
  if (!title && !subtitle) return null;
  return (
    <div className="mb-8">
      {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export function PageAlert({ children, variant = 'error', className = '' }) {
  if (!children) return null;
  return (
    <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${ALERT_VARIANTS[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function PageCard({ children, className = '' }) {
  return <div className={`page-shell-card rounded-xl ${className}`}>{children}</div>;
}

function PageLoading({ className = 'h-64' }) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
    </div>
  );
}

/** Admin route content wrapper — title, loading, errors */
export function AdminPage({ title, subtitle, loading = false, error = null, children }) {
  if (loading) return <PageLoading />;
  return (
    <>
      <PageHeading title={title} subtitle={subtitle} />
      <PageAlert>{error}</PageAlert>
      {children}
    </>
  );
}

/** Public pages with global Header + blue background */
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
    <div className={`min-h-screen relative isolate ${className}`}>
      <PageBackground />
      <div className="relative z-10">
        <Header />
        {loading ? (
          <div className="flex items-center justify-center pt-32 text-gray-400 text-sm">{loadingMessage}</div>
        ) : flush ? (
          <main className={mainClassName}>{children}</main>
        ) : (
          <main className={`${maxWidth} mx-auto px-4 sm:px-6 pt-24 pb-10 ${mainClassName}`}>
            <PageHeading title={title} subtitle={subtitle} />
            {children}
          </main>
        )}
      </div>
    </div>
  );
}
