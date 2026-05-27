import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SiteLayout from '../../components/SiteLayout';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';
import Button from '../../components/Button';
import applicationService from '../../services/applicationService';
import { extractApplications } from '../../utils/dashboard';

function ApplicationRowSkeleton() {
  return (
    <div className="animate-pulse border-b border-gray-100 py-4 last:border-0">
      <div className="h-4 w-48 bg-gray-100 rounded" />
      <div className="h-3 w-32 bg-gray-100 rounded mt-2" />
    </div>
  );
}

export default function MyApplications() {
  const {
    data: applicationsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['applications', 'me'],
    queryFn: () => applicationService.getMyApplications(),
  });

  const applications = useMemo(
    () =>
      extractApplications(applicationsData ?? [])
        .slice()
        .sort((a, b) => new Date(b.appliedAt ?? 0) - new Date(a.appliedAt ?? 0)),
    [applicationsData]
  );

  return (
    <SiteLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My applications</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track every application and its latest status.
            </p>
          </div>
          <Link to="/jobs" className="btn-primary w-fit">
            Browse jobs
          </Link>
        </div>

        {isError ? (
          <div className="surface border-red-200 bg-red-50 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-red-700">
              We could not load your applications right now.
            </p>
            <Button variant="secondary" onClick={() => refetch()} className="w-fit">
              Try again
            </Button>
          </div>
        ) : (
          <div className="surface p-6">
            {isLoading ? (
              <div>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <ApplicationRowSkeleton key={idx} />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-600">You have not applied to any jobs yet.</p>
                <Link to="/jobs" className="btn-secondary mt-4 inline-flex">
                  Find your first role
                </Link>
              </div>
            ) : (
              <ul>
                {applications.map((app) => {
                  const jobId = app.job?.id ?? app.jobId;
                  const jobHref = jobId ? `/jobs/${jobId}` : null;

                  const content = (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                          {app.job?.title ?? app.jobTitle ?? 'Role'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {app.job?.company?.name ?? app.company?.name ?? 'Company'} · Applied{' '}
                          {app.appliedAt
                            ? new Date(app.appliedAt).toLocaleDateString()
                            : 'recently'}
                        </p>
                      </div>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                  );

                  return (
                    <li key={app.id} className="border-b border-gray-100 py-4 last:border-0">
                      {jobHref ? (
                        <Link
                          to={jobHref}
                          className="block -mx-2 px-2 py-1 rounded-lg group hover:bg-gray-50 transition-colors duration-150"
                        >
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
