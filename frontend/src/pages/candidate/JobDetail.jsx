import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ClockIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  HeartIcon,
  LinkIcon,
  CheckCircleIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import SiteLayout from '../../components/SiteLayout';
import JobBreadcrumb from '../../components/JobBreadcrumb';
import { JobMetaBadges } from '../../components/JobMeta';
import JobCard, { JobCardSkeleton } from '../../components/JobCard';
import ApplyJobModal from '../../components/ApplyJobModal';
import Toast from '../../components/Toast';
import Button from '../../components/Button';
import useToast from '../../hooks/useToast';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { addViewedJob } from '../../utils/candidateDashboard';
import {
  formatRelativeTime,
  formatSalary,
  formatWorkMode,
  companyInitials,
} from '../../utils/format';
import { parseJobContent, formatDescriptionParagraphs } from '../../utils/jobContent';
import { isJobSaved, toggleSavedJob } from '../../utils/savedJobs';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  reviewed: 'bg-brand-50 text-brand-800 border-brand-200',
  accepted: 'bg-green-50 text-green-800 border-green-200',
  rejected: 'bg-red-50 text-red-800 border-red-200',
};

function JobDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-2/3 mb-3" />
      <div className="h-5 bg-gray-100 rounded w-1/3 mb-6" />
      <div className="flex gap-8">
        <div className="flex-[7] space-y-4">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
          <div className="h-4 bg-gray-100 rounded w-full" />
        </div>
        <div className="flex-[3] h-64 bg-gray-100 rounded-md" />
      </div>
    </div>
  );
}

function BulletList({ items }) {
  if (!items.length) return null;

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
          <CheckCircleSolidIcon className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function JobDetail() {
  const { id } = useParams();
  const jobId = Number(id);
  const isValidId = Number.isFinite(jobId) && jobId > 0;
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast, showToast, dismissToast } = useToast();

  const { data: job, isLoading: loadingJob, isError: isJobError } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const data = await jobService.getJobById(jobId);
      addViewedJob(data);
      return data;
    },
    enabled: isValidId,
  });

  const { data: similarJobsData } = useQuery({
    queryKey: ['jobs', 'similar', job?.employmentType],
    queryFn: async () => {
      const similar = await jobService.getJobs({
        status: 'open',
        employmentType: job.employmentType,
        limit: 5,
      });
      return similar.data ?? [];
    },
    enabled: !!job,
  });

  const similarJobs = (similarJobsData ?? []).filter((item) => item.id !== jobId).slice(0, 4);

  const { data: applicationData } = useQuery({
    queryKey: ['applications', 'me'],
    queryFn: async () => {
      const data = await applicationService.getMyApplications();
      return data?.applications ?? data?.data ?? data ?? [];
    },
    enabled: !!token && isValidId,
  });

  const applicationList = Array.isArray(applicationData) ? applicationData : [];
  const applicationMatch = applicationList.find(
    (app) => Number(app.jobId ?? app.job?.id) === jobId
  );

  const [application, setApplication] = useState(null);
  const [saved, setSaved] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (applicationMatch) {
      setApplication(applicationMatch);
    }
  }, [applicationMatch]);

  const loading = loadingJob;
  const error = isJobError ? 'This job posting could not be found.' : '';

  useEffect(() => {
    if (!isValidId) {
      navigate('/jobs', { replace: true });
    }
  }, [isValidId, navigate]);

  useEffect(() => {
    if (!isValidId) return;
    setSaved(isJobSaved(jobId));
  }, [jobId, isValidId]);

  const handleApplyClick = () => {
    if (!token) {
      navigate('/login', { state: { from: `/jobs/${jobId}` } });
      return;
    }
    setApplyOpen(true);
  };

  const handleApplySubmit = async ({ jobId: applyJobId, coverLetter, resumeFile }) => {
    try {
      setSubmitting(true);
      const result = await applicationService.submitApplication({
        jobId: applyJobId,
        coverLetter,
        resumeFile,
      });
      setApplication(result?.application ?? result ?? { jobId: applyJobId, status: 'pending' });
      setApplyOpen(false);
      showToast('Application submitted successfully');
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.message ?? 'Unable to submit application. Please try again.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = () => {
    const next = toggleSavedJob(jobId);
    setSaved(next);
    showToast(next ? 'Job saved' : 'Job removed from saved');
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard');
    } catch {
      showToast('Could not copy link', 'error');
    }
  };

  if (!isValidId) return null;

  const companyName = job?.company?.name ?? 'Company';
  const { body, requirements, responsibilities } = job
    ? parseJobContent(job)
    : { body: '', requirements: [], responsibilities: [] };
  const paragraphs = formatDescriptionParagraphs(body);
  const workModeLabel = formatWorkMode(job?.workMode) ?? 'On-site';
  const statusClass = STATUS_STYLES[application?.status] ?? STATUS_STYLES.pending;

  return (
    <SiteLayout bare showFooter>
      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="page-container py-8 pb-16">
        {!loading && !error && job && (
          <JobBreadcrumb jobTitle={job.title} employmentType={job.employmentType} />
        )}
        {(loading || error) && (
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
          >
            ← Back to jobs
          </Link>
        )}

        {loading ? (
          <JobDetailSkeleton />
        ) : error ? (
          <div className="border border-gray-200 rounded-md bg-white p-10 text-center">
            <p className="text-gray-600">{error}</p>
            <Link
              to="/jobs"
              className="inline-block mt-4 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Browse open roles
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <main className="flex-[7] min-w-0">
                <div className="surface p-8 lg:p-10">
                  {application && (
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium mb-5 ${statusClass}`}>
                      <CheckCircleIcon className="w-4 h-4" />
                      Application submitted
                      <span className="capitalize">· {application.status ?? 'pending'}</span>
                    </div>
                  )}

                  <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>

                  {job.company?.website ? (
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-base text-brand-600 hover:text-brand-700 font-medium transition-colors"
                    >
                      {companyName}
                    </a>
                  ) : (
                    <p className="mt-2 text-base text-gray-600 font-medium">{companyName}</p>
                  )}

                  <JobMetaBadges job={job} className="mt-4" />

                  {job.createdAt && (
                    <p className="mt-2 text-sm text-gray-500 inline-flex items-center gap-1.5">
                      <ClockIcon className="w-4 h-4" />
                      Posted {formatRelativeTime(job.createdAt)}
                    </p>
                  )}

                  <p className="mt-5 text-lg font-semibold text-gray-900">
                    {formatSalary(job.budgetMin, job.budgetMax)}
                  </p>

                  {paragraphs.length > 0 && (
                    <section className="mt-8">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">About the role</h2>
                      <div className="prose prose-sm prose-gray max-w-none">
                        {paragraphs.map((paragraph) => (
                          <p key={paragraph.slice(0, 40)}>
                            {paragraph.split('\n').map((line, index, lines) => (
                              <span key={`${line}-${index}`}>
                                {line}
                                {index < lines.length - 1 && <br />}
                              </span>
                            ))}
                          </p>
                        ))}
                      </div>
                    </section>
                  )}

                  {requirements.length > 0 && (
                    <section className="mt-10">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
                      <BulletList items={requirements} />
                    </section>
                  )}

                  {responsibilities.length > 0 && (
                    <section className="mt-10">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Responsibilities</h2>
                      <BulletList items={responsibilities} />
                    </section>
                  )}
                </div>
              </main>

              <aside className="flex-[3] w-full lg:max-w-sm shrink-0 sticky top-24">
                <div className="surface bg-gray-50/80 p-6 lg:sticky lg:top-24">
                  <div className="flex flex-col items-center text-center pb-5 border-b border-gray-200">
                    <div className="w-16 h-16 rounded-md border border-gray-200 bg-white flex items-center justify-center text-lg font-semibold text-gray-600">
                      {companyInitials(companyName)}
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-gray-900">{companyName}</h3>
                  </div>

                  <dl className="mt-5 space-y-3 text-sm">
                    {job.company?.industry && (
                      <div className="flex items-start gap-3">
                        <BuildingOffice2Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <dt className="text-gray-500">Industry</dt>
                          <dd className="text-gray-900 font-medium">{job.company.industry}</dd>
                        </div>
                      </div>
                    )}
                    {job.company?.size && (
                      <div className="flex items-start gap-3">
                        <BuildingOffice2Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <dt className="text-gray-500">Company size</dt>
                          <dd className="text-gray-900 font-medium">{job.company.size} employees</dd>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <ComputerDesktopIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <dt className="text-gray-500">Work arrangement</dt>
                        <dd className="text-gray-900 font-medium">{workModeLabel}</dd>
                      </div>
                    </div>
                    {job.company?.website && (
                      <div className="flex items-start gap-3">
                        <GlobeAltIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <dt className="text-gray-500">Website</dt>
                          <dd>
                            <a
                              href={job.company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-600 hover:text-brand-700 font-medium break-all"
                            >
                              {job.company.website.replace(/^https?:\/\//, '')}
                            </a>
                          </dd>
                        </div>
                      </div>
                    )}
                  </dl>

                  <div className="mt-6 space-y-3">
                    {application ? (
                      <div className={`w-full text-center px-4 py-3 rounded-md border text-sm font-semibold ${statusClass}`}>
                        Application submitted · {application.status ?? 'pending'}
                      </div>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleApplyClick}
                        className="w-full py-3 px-8 font-semibold"
                      >
                        Apply now
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSave}
                      className="w-full"
                    >
                      {saved ? (
                        <HeartSolidIcon className="w-5 h-5 text-red-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5" />
                      )}
                      {saved ? 'Saved' : 'Save job'}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleShare}
                      className="w-full"
                    >
                      <LinkIcon className="w-5 h-5" />
                      Share
                    </Button>
                  </div>
                </div>
              </aside>
            </div>

            {similarJobs.length > 0 && (
              <section className="mt-16">
                <h2 className="text-xl font-semibold text-gray-900 mb-5">Similar jobs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {similarJobs.map((item) => (
                    <JobCard
                      key={item.id}
                      job={item}
                      to={`/jobs/${item.id}`}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <ApplyJobModal
        job={job}
        isOpen={applyOpen}
        onClose={() => setApplyOpen(false)}
        onSubmit={handleApplySubmit}
        submitting={submitting}
      />
    </SiteLayout>
  );
}
