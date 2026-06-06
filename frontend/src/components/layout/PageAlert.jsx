const VARIANTS = {
  error:   'border-red-200 bg-red-50 text-red-600',
  success: 'border-green-200 bg-green-50 text-green-700',
  info:    'border-blue-200 bg-blue-50 text-blue-700',
};

/**
 * Inline alert banner for page-level messages.
 */
export default function PageAlert({ children, variant = 'error', className = '' }) {
  if (!children) return null;

  return (
    <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${VARIANTS[variant]} ${className}`}>
      {children}
    </div>
  );
}
