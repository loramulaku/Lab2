/**
 * Standard page title block used inside PageShell.
 */
export default function PageHeading({ title, subtitle }) {
  if (!title && !subtitle) return null;

  return (
    <div className="mb-8">
      {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
