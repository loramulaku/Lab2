import Button from './Button';

export function PageError({ message, onRetry, className = '' }) {
  return (
    <div className={`surface border-red-200 bg-red-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${className}`.trim()}>
      <p className="text-sm text-red-700">{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry} className="w-fit">
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export function PageLoading({ rows = 4, className = '' }) {
  return (
    <div className={`surface p-5 animate-pulse ${className}`.trim()}>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="h-12 bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
