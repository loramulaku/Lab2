export default function FormInput({ label, error, className = '', ...props }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`page-shell-field w-full px-3 py-2 text-sm text-gray-700 bg-white/90 focus:outline-none rounded-md ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
