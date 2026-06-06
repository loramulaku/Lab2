export default function FormTextarea({ label, error, className = '', rows = 3, ...props }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`page-shell-field w-full px-3 py-2 text-sm text-gray-700 bg-white/90 focus:outline-none rounded-md resize-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
