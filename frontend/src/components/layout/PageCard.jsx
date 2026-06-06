/**
 * Frosted glass panel for page content (forms, detail cards, etc.).
 */
export default function PageCard({ children, className = '' }) {
  return (
    <div className={`page-shell-card rounded-xl ${className}`}>
      {children}
    </div>
  );
}
