import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  SparklesIcon,
  PaperAirplaneIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';
import SiteLayout from '../components/SiteLayout';
import JobSearchHero from '../components/JobSearchHero';
import JobCard, { JobCardSkeleton } from '../components/JobCard';
import jobService from '../services/jobService';

function FadeIn({ children, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
}

const VALUE_PROPS = [
  {
    icon: SparklesIcon,
    title: 'Matched roles',
    description: 'See jobs that fit your skills and experience — not endless unrelated listings.',
  },
  {
    icon: PaperAirplaneIcon,
    title: 'One-click apply',
    description: 'Your profile, resume, and cover letter travel with you. Apply without retyping everything.',
  },
  {
    icon: BellAlertIcon,
    title: 'Track every step',
    description: 'Candidates follow application status. Recruiters move people through a clear pipeline.',
  },
];

const CANDIDATE_STEPS = [
  { n: '1', title: 'Build your profile', text: 'Add skills, experience, and a headline recruiters notice.' },
  { n: '2', title: 'Search and filter', text: 'Find roles by title, city, work arrangement, and salary.' },
  { n: '3', title: 'Apply and track', text: 'Submit in one click and follow updates on your dashboard.' },
];

const RECRUITER_STEPS = [
  { n: '1', title: 'Set up your company', text: 'Add your team profile, logo, and hiring details.' },
  { n: '2', title: 'Post open roles', text: 'Publish jobs with requirements, salary range, and deadlines.' },
  { n: '3', title: 'Review on kanban', text: 'Move candidates through your pipeline with drag-and-drop.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
  const [heroLocation, setHeroLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [liveStats, setLiveStats] = useState({ jobs: null, companies: null });

  useEffect(() => {
    jobService
      .getJobs({ limit: 100, status: 'open' })
      .then((data) => {
        const list = data?.data ?? data ?? [];
        const jobs = Array.isArray(list) ? list : [];
        const companies = new Set(
          jobs.map((j) => j.company?.name).filter(Boolean)
        ).size;
        setFeaturedJobs(jobs.slice(0, 4));
        setLiveStats({ jobs: jobs.length, companies });
      })
      .catch(() => {
        setFeaturedJobs([]);
        setLiveStats({ jobs: 0, companies: 0 });
      })
      .finally(() => setJobsLoading(false));
  }, []);

  const handleHeroSearch = () => {
    const params = new URLSearchParams();
    if (heroSearch.trim()) params.set('q', heroSearch.trim());
    if (heroLocation.trim()) params.set('where', heroLocation.trim());
    const qs = params.toString();
    navigate(qs ? `/jobs?${qs}` : '/jobs');
  };

  return (
    <SiteLayout bare showFooter>
      {/* Hero — search is the primary action */}
      <section className="page-container py-14 lg:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
              Find work that fits.
              <span className="block text-brand-600 mt-1">Hire people who do.</span>
            </h1>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              Search open roles, apply with your profile, and track every application —
              or post jobs and run your pipeline in one place.
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <JobSearchHero
              search={heroSearch}
              location={heroLocation}
              onSearchChange={setHeroSearch}
              onLocationChange={setHeroLocation}
              onSubmit={handleHeroSearch}
              variant="home"
            />
            <p className="mt-3 text-xs text-gray-500">
              City search is optional. Use filters on the results page for Remote, Hybrid, or On-site.
            </p>
          </FadeIn>

          <FadeIn className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="btn-primary px-6 py-3">
              Create free account
            </Link>
            <a href="#how-it-works" className="btn-secondary px-6 py-3">
              See how it works
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Live platform snapshot — honest numbers from the API */}
      <section className="border-y border-gray-200 bg-gray-50 py-10">
        <div className="page-container">
          {jobsLoading ? (
            <div className="h-12 flex items-center justify-center">
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : liveStats.jobs > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-4 text-center">
              <div>
                <p className="text-3xl font-bold text-gray-900 tabular-nums">{liveStats.jobs}</p>
                <p className="text-sm text-gray-600 mt-1">Open roles right now</p>
              </div>
              {liveStats.companies > 0 && (
                <div>
                  <p className="text-3xl font-bold text-gray-900 tabular-nums">{liveStats.companies}</p>
                  <p className="text-sm text-gray-600 mt-1">Companies hiring</p>
                </div>
              )}
              <Link to="/jobs" className="btn-secondary">
                Browse all jobs
              </Link>
            </div>
          ) : (
            <div className="text-center max-w-lg mx-auto">
              <p className="text-gray-700 font-medium">Roles will show up here as companies post them.</p>
              <p className="text-sm text-gray-500 mt-2">
                Create a profile now so you&apos;re ready when new matches land.
              </p>
              <Link to="/register" className="btn-primary mt-4 inline-flex">
                Get started
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why HireFlow */}
      <section id="why" className="page-container py-16 lg:py-20">
        <FadeIn>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Why HireFlow</h2>
          <p className="text-gray-600 mb-10 max-w-xl">
            Hiring software should feel obvious — for people looking for work and teams doing the hiring.
          </p>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUE_PROPS.map(({ icon: Icon, title, description }) => (
            <FadeIn key={title}>
              <div className="surface p-6 h-full hover:border-gray-300 transition-colors duration-150">
                <div className="bg-brand-50 p-3 rounded-lg w-fit text-brand-600 mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Featured jobs — same cards as browse page */}
      <section className="bg-slate-50 border-y border-gray-200 py-16">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Open roles</h2>
              <p className="text-sm text-gray-500 mt-1">Same listings you&apos;ll see when you search</p>
            </div>
            <Link to="/jobs" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {jobsLoading
              ? Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)
              : featuredJobs.length > 0
                ? featuredJobs.map((job) => (
                    <JobCard key={job.id} job={job} to={`/jobs/${job.id}`} showApply />
                  ))
                : (
                  <div className="col-span-full surface py-12 px-6 text-center">
                    <p className="text-gray-700 font-medium">No open roles yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Check back soon or create a profile to get notified when matches appear.
                    </p>
                    <Link to="/register" className="btn-primary mt-4 inline-flex">
                      Create profile
                    </Link>
                  </div>
                )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="page-container py-16 lg:py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">How it works</h2>
        <p className="text-gray-600 mb-10 max-w-xl">
          Two sides of the same platform — candidates search and apply, recruiters post and review.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <FadeIn>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">For candidates</h3>
            <ol className="space-y-6">
              {CANDIDATE_STEPS.map(({ n, title, text }) => (
                <li key={n} className="flex gap-4">
                  <span className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {n}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{title}</p>
                    <p className="text-sm text-gray-600 mt-1">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link to="/jobs" className="btn-primary mt-8 inline-flex">
              Start searching
            </Link>
          </FadeIn>
          <FadeIn>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">For recruiters</h3>
            <ol className="space-y-6">
              {RECRUITER_STEPS.map(({ n, title, text }) => (
                <li key={n} className="flex gap-4">
                  <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {n}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{title}</p>
                    <p className="text-sm text-gray-600 mt-1">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link to="/register?role=recruiter" className="btn-secondary mt-8 inline-flex">
              Post your first job
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="page-container flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Ready when you are</h2>
            <p className="text-gray-400 mt-2 max-w-md">
              Whether you&apos;re hiring or job hunting, it starts with one account.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary px-6 py-3">
              I&apos;m looking for a job
            </Link>
            <Link
              to="/register?role=recruiter"
              className="btn-secondary border-gray-600 text-white bg-transparent hover:bg-gray-800 hover:border-gray-500 px-6 py-3"
            >
              I&apos;m hiring
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
