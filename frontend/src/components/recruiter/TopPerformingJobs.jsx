export default function TopPerformingJobs({ jobs, loading }) {
  const maxCount = Math.max(...jobs.map((j) => j.applicationCount), 1);

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-md bg-white p-5 space-y-4">
        <div className="h-5 w-44 bg-gray-100 rounded animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-2 bg-gray-100 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-md bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900 mb-5">Top performing jobs</h2>

      {jobs.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">
          Post a job to start receiving applications.
        </p>
      ) : (
        <ul className="space-y-5">
          {jobs.map((job) => {
            const width = `${Math.round((job.applicationCount / maxCount) * 100)}%`;

            return (
              <li key={job.id}>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                  <span className="text-sm text-gray-500 tabular-nums shrink-0">
                    {job.applicationCount}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-md overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-md transition-all duration-500"
                    style={{ width }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
