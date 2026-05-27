import { Link } from 'react-router-dom';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import { HOME_PATH } from '../constants/appNavigation';

const VARIANTS = {
  default: {
    icon: 'bg-gray-900 text-white group-hover:bg-gray-800',
    text: 'text-gray-900',
    accent: 'text-brand-600',
    showText: true,
  },
  auth: {
    icon: 'bg-blue-600 text-white group-hover:bg-blue-700',
    text: 'text-gray-900',
    accent: 'text-blue-600',
    showText: true,
  },
  light: {
    icon: 'bg-blue-700 text-white group-hover:bg-blue-600',
    text: 'text-white',
    accent: 'text-white',
    showText: true,
  },
  footer: {
    icon: '',
    text: 'text-white',
    accent: 'text-white',
    showText: true,
    textOnly: true,
  },
};

/**
 * Brand mark — navigates home by default, or to a custom route when specified.
 */
export default function BrandLogo({
  variant = 'default',
  className = '',
  showText,
  to = HOME_PATH,
  compact = false,
}) {
  const styles = VARIANTS[variant] ?? VARIANTS.default;
  const displayText = showText ?? styles.showText;

  return (
    <Link
      to={to}
      aria-label="HireFlow home"
      className={`inline-flex items-center gap-2.5 shrink-0 group transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      {!styles.textOnly && (
        <div className={`p-1.5 rounded-lg transition-colors duration-150 ${styles.icon}`}>
          <BriefcaseIcon className="w-5 h-5" />
        </div>
      )}
      {displayText && (
        <span className={`font-bold text-lg tracking-tight ${styles.text} ${compact ? 'hidden sm:inline' : ''}`}>
          Hire<span className={styles.accent}>Flow</span>
        </span>
      )}
    </Link>
  );
}
