import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckBadgeIcon,
  PlusIcon,
  QueueListIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import SiteLayout from '../../components/SiteLayout';
import Toast from '../../components/Toast';
import PageHeader from '../../components/PageHeader';
import { PageError } from '../../components/PageFeedback';
import useToast from '../../hooks/useToast';
import DashboardStatCard from '../../components/recruiter/DashboardStatCard';
import RecentApplicationsTable from '../../components/recruiter/RecentApplicationsTable';
import TopPerformingJobs from '../../components/recruiter/TopPerformingJobs';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import {
  DATE_RANGES,
  getRangeWindows,
  isInWindow,
  calcTrend,
  normalizeApplication,
  extractJobs,
  extractApplications,
} from '../../utils/dashboard';

const QUICK_ACTIONS = [
  {
    label: 'Post job',
    description: 'Create a new listing',
    href: '/recruiter/jobs/new',
    icon: PlusIcon,
  },
  {
    label: 'View all applications',
    description: 'Open the kanban board',
    href: '/recruiter/applications',
    icon: QueueListIcon,
  },
  {
    label: 'Manage jobs',
    description: 'Edit active listings',
    href: '/recruiter/jobs',
    icon: Squares2X2Icon,
  },
];

function filterByCurrentRange(apps, rangeKey) {
  const { currentStart, currentEnd } = getRangeWindows(rangeKey);
  if (currentStart == null) return apps;
  return apps.filter((app) => isInWindow(app.appliedAt, currentStart, currentEnd));
}

function countInPreviousRange(apps, rangeKey, predicate) {
  const { previousStart, previousEnd } = getRangeWindows(rangeKey);
  if (previousStart == null) return 0;
  return apps.filter(
    (app) =>
      isInWindow(app.appliedAt, previousStart, previousEnd) && predicate(app)
  ).length;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast, showToast, dismissToast } = useToast();
  const queryClient = useQueryClient();

  const [dateRange, setDateRange] = useState('30d');
  const [updatingId, setUpdatingId] = useState(null);

  const { data: jobs = [], isLoading: loadingJobs, isError: isJobsError, refetch: refetchJobs } = useQuery({
    queryKey: ['recruiter', 'jobs'],
    queryFn: async () => {
      const jobsResponse = await jobService.getMyJobs();
      return extractJobs(jobsResponse);
    },
  });

  const { data: applications = [], isLoading: loadingApps, isError: isAppsError, refetch: refetchApps } = useQuery({
    queryKey: ['recruiter', 'applications', jobs.map(j => j.id).join(',')],
    queryFn: async () => {
      if (!jobs.length) return [];
      const results = await Promise.allSettled(
        jobs.map((job) => applicationService.getApplicationsByJob(job.id))
      );
      const allApplications = [];
      jobs.forEach((job, index) => {
        const result = results[index];
        if (result.status !== 'fulfilled') return;
        extractApplications(result.value).forEach((app) => {
          allApplications.push(normalizeApplication(app, job));
        });
      });
      return allApplications;
    },
    enabled: jobs.length > 0,
  });

  const loading = loadingJobs || (jobs.length > 0 && loadingApps);
  const error = (isJobsError || isAppsError) ? 'Unable to load dashboard data. Please try again.' : '';

  const loadDashboard = () => {
    refetchJobs();
    if (jobs.length > 0) refetchApps();
  };

  const filteredApplications = useMemo(
    () => filterByCurrentRange(applications, dateRange),
    [applications, dateRange]
  );

  const stats = useMemo(() => {
    const activeJobs = jobs.filter((job) => job.status === 'open').length;
    const totalApplications = filteredApplications.length;
    const pendingReviews = filteredApplications.filter(
      (app) => app.status === 'pending'
    ).length;
    const acceptedOffers = filteredApplications.filter(
      (app) => app.status === 'accepted'
    ).length;

    const prevTotal = countInPreviousRange(applications, dateRange, () => true);
    const prevPending = countInPreviousRange(
      applications,
      dateRange,
      (app) => app.status === 'pending'
    );
    const prevAccepted = countInPreviousRange(
      applications,
      dateRange,
      (app) => app.status === 'accepted'
    );

    return {
      activeJobs: {
        value: activeJobs,
        trend: 0,
      },
      totalApplications: {
        value: totalApplications,
        trend: dateRange === 'all' ? 0 : calcTrend(totalApplications, prevTotal),
      },
      pendingReviews: {
        value: pendingReviews,
        trend: dateRange === 'all' ? 0 : calcTrend(pendingReviews, prevPending),
      },
      acceptedOffers: {
        value: acceptedOffers,
        trend: dateRange === 'all' ? 0 : calcTrend(acceptedOffers, prevAccepted),
      },
    };
  }, [jobs, filteredApplications, applications, dateRange]);

  const recentApplications = useMemo(
    () =>
      [...filteredApplications]
        .sort(
          (a, b) =>
            new Date(b.appliedAt ?? 0).getTime() - new Date(a.appliedAt ?? 0).getTime()
        )
        .slice(0, 10),
    [filteredApplications]
  );

  const topJobs = useMemo(() => {
    const counts = filteredApplications.reduce((acc, app) => {
      acc[app.jobId] = (acc[app.jobId] ?? 0) + 1;
      return acc;
    }, {});

    return jobs
      .map((job) => ({
        id: job.id,
        title: job.title,
        applicationCount: counts[job.id] ?? job.applicationCount ?? 0,
      }))
      .sort((a, b) => b.applicationCount - a.applicationCount)
      .slice(0, 5);
  }, [jobs, filteredApplications]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => applicationService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      setUpdatingId(id);
      await queryClient.cancelQueries({ queryKey: ['recruiter', 'applications'] });
      const previousApps = queryClient.getQueryData(['recruiter', 'applications', jobs.map(j => j.id).join(',')]);
      queryClient.setQueryData(
        ['recruiter', 'applications', jobs.map(j => j.id).join(',')],
        (old) => old?.map((item) => (item.id === id ? { ...item, status } : item))
      );
      return { previousApps };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ['recruiter', 'applications', jobs.map(j => j.id).join(',')],
        context.previousApps
      );
      showToast(err.response?.data?.message ?? 'Unable to update application status.', 'error');
    },
    onSuccess: (_, variables) => {
      showToast(`Application ${variables.status}`);
    },
    onSettled: () => {
      setUpdatingId(null);
      queryClient.invalidateQueries({ queryKey: ['recruiter', 'applications'] });
    },
  });

  const handleStatusUpdate = (app, status) => {
    updateStatusMutation.mutate({ id: app.id, status });
  };

  const handleView = (app) => {
    navigate('/recruiter/applications', { state: { applicationId: app.id } });
  };

  return (
    <SiteLayout>
      <Toast toast={toast} onDismiss={dismissToast} />
      <PageHeader
        title="Dashboard"
        subtitle="Track hiring activity across your open roles"
        className="mb-8"
        actions={(
          <>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-field py-2.5"
              aria-label="Date range"
            >
              {DATE_RANGES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <Link to="/recruiter/jobs/new" className="btn-primary whitespace-nowrap">
              <PlusIcon className="w-4 h-4" />
              Post new job
            </Link>
          </>
        )}
      />

        {error && (
          <PageError message={error} onRetry={loadDashboard} className="mb-6" />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <DashboardStatCard
            label="Active jobs"
            value={stats.activeJobs.value}
            trend={stats.activeJobs.trend}
            icon={BriefcaseIcon}
            loading={loading}
          />
          <DashboardStatCard
            label="Total applications"
            value={stats.totalApplications.value}
            trend={stats.totalApplications.trend}
            icon={DocumentTextIcon}
            loading={loading}
          />
          <DashboardStatCard
            label="Pending reviews"
            value={stats.pendingReviews.value}
            trend={stats.pendingReviews.trend}
            loading={loading}
            icon={ClockIcon}
          />
          <DashboardStatCard
            label="Accepted offers"
            value={stats.acceptedOffers.value}
            trend={stats.acceptedOffers.trend}
            icon={CheckBadgeIcon}
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-8">
          <div className="xl:col-span-3 min-w-0">
            <RecentApplicationsTable
              applications={recentApplications}
              loading={loading}
              onView={handleView}
              onAccept={(app) => handleStatusUpdate(app, 'accepted')}
              onReject={(app) => handleStatusUpdate(app, 'rejected')}
              updatingId={updatingId}
            />
          </div>

          <div className="xl:col-span-2 min-w-0">
            <TopPerformingJobs jobs={topJobs} loading={loading} />
          </div>
        </div>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {QUICK_ACTIONS.map(({ label, description, href, icon: Icon }) => (
              <Link key={href} to={href} className="surface p-5 flex items-start gap-4 hover:border-gray-300 transition-colors group">
                <div className="p-2.5 rounded-md bg-gray-50 border border-gray-100 text-gray-500 group-hover:text-brand-600 group-hover:border-brand-100 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
    </SiteLayout>
  );
}
