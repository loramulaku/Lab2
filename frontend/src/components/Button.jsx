const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn bg-red-600 text-white hover:bg-red-700 px-4 py-2.5',
};

const SIZES = {
  sm: 'text-xs px-3 py-1.5',
  md: '',
  lg: 'text-base px-6 py-3',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const sizeClass = SIZES[size] && size !== 'md' ? SIZES[size] : '';

  return (
    <button
      type="button"
      className={`${VARIANTS[variant] ?? VARIANTS.primary} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  const sizeClass = SIZES[size] && size !== 'md' ? SIZES[size] : '';

  return (
    <a
      className={`${VARIANTS[variant] ?? VARIANTS.primary} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </a>
  );
}
