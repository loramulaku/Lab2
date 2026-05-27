import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BriefcaseIcon,
  EyeIcon,
  BookmarkIcon,
  SparklesIcon,
  PencilSquareIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import SiteLayout from '../../components/SiteLayout';
import JobCard, { JobCardSkeleton } from '../../components/JobCard';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';
import PageHeader from '../../components/PageHeader';
import authService from '../../services/authService';
import candidateService from '../../services/candidateService';
import applicationService from '../../services/applicationService';
import jobService from '../../services/jobService';
import {
  calcProfileCompletion,
  recommendJobs,
  getViewedJobs,
  getSavedJobCount,
} from '../../utils/candidateDashboard';
import { extractApplications } from '../../utils/dashboard';

const TIMELINE_STEPS = ['pending', 'reviewed', 'shortlisted', 'accepted'];

function ProfileCompletionBar({ segments, total }) {
  const shades = ['bg-brand-300', 'bg-brand-400', 'bg-brand-500', 'bg-brand-600'];
  const keys = ['profile', 'skills', 'experience', 'education'];

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-600">Profile completion</span>
        <span className="font-semibold text-gray-900">{total}%</span>
      </div>
      <div className="flex h-2.5 rounded-md overflow-hidden bg-gray-100 gap-0.5">
        {keys.map((key, i) => (
          <div
            key={key}
            className={`flex-1 transition-all duration-500 ${shades[i]}`}
            style={{ opacity: segments[key] > 0 ? 1 : 0.2 }}
            title={`${key}: ${segments[key]}%`}
          />
        ))}
      </div>
    </div>
  );
}

function ApplicationTimeline({ status }) {
  const current = TIMELINE_STEPS.indexOf(status?.toLowerCase());
  const rejected = status?.toLowerCase() === 'rejected';

  return (
    <div className="flex items-center gap-1 mt-2">
      {TIMELINE_STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full ${
              rejected ? 'bg-red-400' :
              i <= current ? 'bg-brand-600' : 'bg-gray-200'
            }`}
          />
          {i < TIMELINE_STEPS.length - 1 && (
            <div className={`w-4 h-0.5 ${i < current ? 'bg-brand-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CandidateDashboard() {
  const { data: me, isError: isMeError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.getMe(),
  });

  const { data: profileData, isLoading: loadingProfile, isError: isProfileError } = useQuery({
    queryKey: ['candidate', 'profile'],
    queryFn: async () => {
      try {
        return await candidateService.getProfile();
      } catch {
        return me ?? {};
      }
    },
    enabled: !!me,
  });

  const { data: applicationsData, isLoading: loadingApps, isError: isAppsError } = useQuery({
    queryKey: ['applications', 'me'],
    queryFn: () => applicationService.getMyApplications(),
  });

  const { data: jobsData, isLoading: loadingJobs, isError: isJobsError } = useQuery({
    queryKey: ['jobs', 'open'],
    queryFn: () => jobService.getJobs({ status: 'open', limit: 50 }),
  });

  const profile = profileData ?? me ?? {};
  const applications = useMemo(() => extractApplications(applicationsData ?? []), [applicationsData]);
  const jobs = jobsData?.data ?? jobsData ?? [];

  const recommended = useMemo(() => {
    const skillNames = (profile?.skills ?? []).map((s) => s.name ?? s);
    return recommendJobs(jobs, skillNames, 3);
  }, [jobs, profile]);

  const [viewedJobs, setViewedJobs] = useState([]);
  useEffect(() => {
    setViewedJobs(getViewedJobs());
  }, []);

  const loading = loadingProfile || loadingApps || loadingJobs;
  const hasLoadError = isMeError || isProfileError || isAppsError || isJobsError;

  const completion = useMemo(
    () => calcProfileCompletion(profile ?? {}),
    [profile]
  );

  const recentApps = useMemo(
    () =>
      [...applications]
        .sort((a, b) => new Date(b.appliedAt ?? 0) - new Date(a.appliedAt ?? 0))
        .slice(0, 5),
    [applications]
  );

  const firstName = profile?.firstName ?? 'there';

  return (
    <SiteLayout>
        <section className="mb-10">
          <PageHeader
            title={`Welcome back, ${firstName}!`}
            subtitle="Here's what's happening with your job search"
          />
          <ProfileCompletionBar segments={completion.segments} total={completion.total} />
          {completion.total < 100 && (
            <Link
              to="/my-profile"
              className="inline-block mt-4 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Complete your profile →
            </Link>
          )}
        </section>

        {hasLoadError && (
          <div className="surface border-red-200 bg-red-50 px-4 py-3 mb-8">
            <p className="text-sm text-red-700">
              Some dashboard data failed to load. Refresh to retry.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-10">
          <section className="lg:col-span-4 surface p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">My applications</h2>
              <Link to="/my-applications" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                View all
              </Link>
            </div>
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded" />
                ))}
              </div>
            ) : recentApps.length === 0 ? (
              <p className="text-sm text-gray-500 py-6">
                No applications yet.{' '}
                <Link to="/jobs" className="text-brand-600 hover:underline">Browse jobs</Link>
              </p>
            ) : (
              <ul className="space-y-4">
                {recentApps.map((app) => (
                  <li key={app.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {app.job?.title ?? app.jobTitle ?? 'Role'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {app.appliedAt
                            ? new Date(app.appliedAt).toLocaleDateString()
                            : 'Recently applied'}
                        </p>
                      </div>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                    <ApplicationTimeline status={app.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="lg:col-span-3 surface p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Recommended jobs</h2>
              <Link to="/jobs" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                See more
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <JobCardSkeleton key={i} variant="compact" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recommended.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">
                    No recommendations yet.{' '}
                    <Link to="/jobs" className="text-brand-600 hover:underline">Browse all jobs</Link>
                  </p>
                ) : (
                  recommended.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      variant="compact"
                      matchScore={job.matchScore}
                      to={`/jobs/${job.id}`}
                    />
                  ))
                )}
              </div>
            )}
          </section>

          <section className="lg:col-span-3 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Profile stats</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <EyeIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">—</p>
                    <p className="text-xs text-gray-500">Profile views</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookmarkIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">{getSavedJobCount()}</p>
                    <p className="text-xs text-gray-500">Saved jobs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SparklesIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">
                      {profile?.skills?.length ?? 0}
                    </p>
                    <p className="text-xs text-gray-500">Skills listed</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Quick actions</h2>
              <div className="space-y-2">
                <Link
                  to="/my-profile"
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-brand-600 py-2 transition-colors"
                >
                  <PencilSquareIcon className="w-4 h-4" /> Edit profile
                </Link>
                <Link
                  to="/my-profile"
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-brand-600 py-2 transition-colors"
                >
                  <DocumentArrowUpIcon className="w-4 h-4" /> Update resume
                </Link>
                <Link
                  to="/my-profile"
                  className="flex items-center gap-3 text-sm text-gray-700 hover:text-brand-600 py-2 transition-colors"
                >
                  <BriefcaseIcon className="w-4 h-4" /> Add skills
                </Link>
              </div>
            </div>
          </section>
        </div>

        {viewedJobs.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Recently viewed jobs</h2>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1">
              {viewedJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="snap-start shrink-0 w-64 border border-gray-200 rounded-md bg-white p-4 hover:border-gray-300 transition-colors"
                >
                  <p className="text-sm font-semibold text-gray-900 truncate">{job.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{job.company}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
    </SiteLayout>
  );
}
