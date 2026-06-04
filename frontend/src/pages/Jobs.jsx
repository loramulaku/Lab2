import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import BidModal from '../components/freelance/BidModal';
import { useAuth } from '../context/AuthContext';
import freelanceService from '../services/freelanceService';
import candidateService from '../services/candidateService';

/**
 * Public job board with header filters (FEATURE 2).
 *   /jobs            → all open jobs
 *   /jobs/full-time  → employment_type = full-time
 *   /jobs/part-time  → employment_type = part-time
 *   /jobs/freelance  → employment_type = freelance
 *
 * Candidates can Apply to standard jobs, or Bid on public freelance jobs.
 */
const FILTERS = [
  { key: '',          label: 'All Jobs',  to: '/jobs' },
  { key: 'full-time', label: 'Full-time', to: '/jobs/full-time' },
  { key: 'part-time', label: 'Part-time', to: '/jobs/part-time' },
  { key: 'freelance', label: 'Freelance', to: '/jobs/freelance' },
];

export default function Jobs() {
  const { filter } = useParams();          // 'full-time' | 'part-time' | 'freelance' | undefined
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCandidate = (user?.roles ?? []).includes('candidate');

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidJob, setBidJob] = useState(null);
  const [feedback, setFeedback] = useState({});   // { [jobId]: { type, msg } }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { status: 'open', limit: 100 };
      if (filter) params.employmentType = filter;
      const res = await freelanceService.listJobs(params);
      setJobs(res.data ?? []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const apply = async (job) => {
    if (!user) { navigate('/login'); return; }
    try {
      await candidateService.applyToJob(job.id);
      setFeedback(f => ({ ...f, [job.id]: { type: 'ok', msg: 'Applied ✓' } }));
    } catch (err) {
      setFeedback(f => ({ ...f, [job.id]: { type: 'err', msg: err?.response?.data?.message || 'Failed to apply' } }));
    }
  };

  const submitBid = async ({ price, deliveryTimeDays, message }) => {
    await freelanceService.submitBid(bidJob.id, { price, deliveryTimeDays, message });
    setFeedback(f => ({ ...f, [bidJob.id]: { type: 'ok', msg: 'Bid submitted ✓' } }));
  };

  const renderAction = (job) => {
    const fb = feedback[job.id];
    if (fb) return <span className={`text-sm ${fb.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{fb.msg}</span>;

    const isFreelance = job.employmentType === 'freelance';
    const acceptsBids = isFreelance && ['public', 'both'].includes(job.jobMode);

    if (!user) return <Link to="/login" className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50">Sign in to apply</Link>;
    if (!isCandidate) return null;

    if (isFreelance) {
      return acceptsBids
        ? <button onClick={() => setBidJob(job)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Submit Bid</button>
        : <span className="text-xs text-gray-400">Invite only</span>;
    }
    return <button onClick={() => apply(job)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Apply</button>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto pt-24 pb-10 px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Browse Jobs</h1>
        <p className="text-sm text-gray-500 mb-5">Find your next role — full-time, part-time, or freelance.</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(f => {
            const active = (filter ?? '') === f.key;
            return (
              <Link key={f.key} to={f.to}
                className={`px-4 py-1.5 text-sm font-medium border transition ${
                  active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}>
                {f.label}
              </Link>
            );
          })}
        </div>

        {loading ? <p className="text-sm text-gray-400">Loading…</p>
          : jobs.length === 0 ? (
            <div className="bg-white border border-gray-200 text-center py-16 text-gray-400">
              <p className="text-lg">No jobs found</p>
              <p className="text-sm mt-1">Try a different filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <div key={job.id} className="bg-white border border-gray-200 px-5 py-4 flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {job.company?.name ?? 'Company'} · {job.employmentType} · {job.workMode}
                    </p>
                    {(job.budgetMin || job.budgetMax) && (
                      <p className="text-sm text-gray-600 mt-1">
                        ${Number(job.budgetMin ?? 0).toLocaleString()} – ${Number(job.budgetMax ?? 0).toLocaleString()}
                      </p>
                    )}
                    {job.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{job.description}</p>}
                  </div>
                  <div className="flex-shrink-0">{renderAction(job)}</div>
                </div>
              ))}
            </div>
          )}
      </div>

      {bidJob && <BidModal job={bidJob} onSubmit={submitBid} onClose={() => setBidJob(null)} />}
    </div>
  );
}
