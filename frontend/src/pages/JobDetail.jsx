import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageShell } from '../components/layout';
import BidModal from '../components/freelance/BidModal';
import FreelanceModeGate from '../components/freelance/FreelanceModeGate';
import ApplicationForm from '../components/jobs/ApplicationForm';
import { useAuth } from '../context/AuthContext';
import freelanceService from '../services/freelanceService';
import candidateService from '../services/candidateService';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? '';

const TYPE_BADGE = {
  'full-time':  'bg-blue-100 text-blue-800',
  'part-time':  'bg-green-100 text-green-800',
  'internship': 'bg-purple-100 text-purple-800',
  'freelance':  'bg-indigo-100 text-indigo-800',
};

function Section({ title, content }) {
  if (!content?.trim()) return null;
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{content}</div>
    </div>
  );
}

function fmtSchedule(s) {
  if (!s?.days?.length && !s?.startTime) return null;
  return `${s.days?.join(', ')} · ${s.startTime}–${s.endTime}`;
}

export default function JobDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const isCandidate = (user?.roles ?? []).includes('candidate');

  const [job,        setJob]      = useState(null);
  const [loading,    setLoading]  = useState(true);
  const [bidOpen,    setBidOpen]  = useState(false);
  const [gateOpen,   setGateOpen] = useState(false);
  const [applyOpen,  setApplyOpen] = useState(false);
  const [feedback,   setFeedback] = useState(null);
  const [isSaved,        setIsSaved]        = useState(false);
  const [freelanceActive, setFreelanceActive] = useState(null);
  const [appliedStatus,  setAppliedStatus]  = useState(null);
  const [hasBid,         setHasBid]         = useState(false);

  useEffect(() => {
    freelanceService.getJob(id)
      .then(setJob)
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isCandidate) return;
    const numId = Number(id);
    candidateService.getSavedJobIds().then(ids => setIsSaved(ids.includes(numId))).catch(() => {});
    candidateService.getProfile().then(p => setFreelanceActive(!!p.freelanceActive)).catch(() => {});
    candidateService.myApplications({ limit: 200 })
      .then(r => {
        const match = (r.data ?? []).find(a => a.jobId === numId);
        if (match) setAppliedStatus(match.status);
      }).catch(() => {});
    freelanceService.myBids({ limit: 200 })
      .then(r => {
        const match = (r.data ?? []).find(b => b.jobId === numId && b.status !== 'withdrawn');
        if (match) setHasBid(true);
      }).catch(() => {});
  }, [id, isCandidate]);

  if (loading) {
    return (
      <PageShell width="sm" mainClassName="pt-28">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200/80 w-1/2 rounded"/>
          <div className="h-4 bg-gray-100 w-1/3 rounded"/>
          <div className="h-40 bg-gray-100/80 rounded-xl"/>
        </div>
      </PageShell>
    );
  }

  if (!job) {
    return (
      <PageShell width="sm" mainClassName="pt-28 text-center">
        <p className="text-gray-500 text-lg">Job not found.</p>
        <Link to="/jobs" className="text-blue-600 text-sm hover:underline mt-2 inline-block">← Back to jobs</Link>
      </PageShell>
    );
  }

  const isFreelance = job.workMode === 'freelance';
  const canBid      = !!job.acceptsBids;
  const logoSrc     = job.company?.logoPath ? `${API_BASE}${job.company.logoPath}` : null;
  const sched       = fmtSchedule(job.schedule);

  const toggleSave = async () => {
    if (!isCandidate) return;
    if (isSaved) {
      await candidateService.unsaveJob(Number(id)).catch(() => {});
      setIsSaved(false);
    } else {
      await candidateService.saveJob(Number(id)).catch(() => {});
      setIsSaved(true);
    }
  };

  const handleBidClick = () => {
    if (!freelanceActive) { setGateOpen(true); return; }
    setBidOpen(true);
  };

  const submitApplication = async (data) => {
    const res = await candidateService.applyToJob(job.id, data);
    setApplyOpen(false);
    setAppliedStatus('pending');
    setFeedback({ ok: true, msg: res?.message || 'Application submitted — In review ✓' });
  };

  const submitBid = async (data) => {
    await freelanceService.submitBid(job.id, data);
    setHasBid(true);
    setFeedback({ ok: true, msg: 'Bid submitted ✓' });
    setBidOpen(false);
  };

  return (
    <PageShell width="sm" mainClassName="pb-12">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1">
          ← Back to results
        </button>

        {/* ── 1. Overview ──────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 p-6 mb-4">
          <div className="flex gap-4 items-start">
            {logoSrc
              ? <img src={logoSrc} alt={job.company?.name} className="w-16 h-16 object-contain border border-gray-100 bg-white flex-shrink-0" />
              : (
                <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg bg-blue-600">
                  {(job.company?.name ?? '?').slice(0, 2).toUpperCase()}
                </div>
              )
            }
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-base text-gray-600 mt-0.5">{job.company?.name}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {job.company?.location && (
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {job.company.location}
                  </span>
                )}
                <span className={`text-xs font-medium px-2 py-0.5 ${TYPE_BADGE[job.employmentType] ?? 'bg-gray-100 text-gray-700'}`}>
                  {isFreelance ? 'Freelance' : job.employmentType?.replace(/-/g, '‑')}
                </span>
                {!isFreelance && job.workMode && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5">{job.workMode}</span>
                )}
                {job.experienceLevel && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 font-medium">
                    {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}
                  </span>
                )}
              </div>
              {(job.budgetMin || job.budgetMax) && (
                <p className="text-base font-semibold text-blue-700 mt-2">
                  ${Number(job.budgetMin ?? 0).toLocaleString()}–${Number(job.budgetMax ?? 0).toLocaleString()}
                  {isFreelance ? '' : '/yr'}
                </p>
              )}
              {sched && (
                <p className="text-sm text-purple-700 mt-1">📅 {sched}</p>
              )}
              {job.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {job.categories.map(c => (
                    <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5">{c}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Apply / Bid action + bookmark */}
            <div className="flex-shrink-0 flex items-center gap-3">
              {isCandidate && (
                <button onClick={toggleSave} title={isSaved ? 'Remove bookmark' : 'Save job'}
                  className={`transition ${isSaved ? 'text-blue-600' : 'text-gray-300 hover:text-gray-500'}`}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                  </svg>
                </button>
              )}
              {feedback ? (
                <span className={`text-sm font-medium ${feedback.ok ? 'text-green-600' : 'text-red-600'}`}>{feedback.msg}</span>
              ) : !user ? (
                <Link to="/login" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Sign in to apply</Link>
              ) : isCandidate ? (
                isFreelance
                  ? canBid
                    ? hasBid
                      ? <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2">Bid submitted</span>
                      : <button onClick={handleBidClick} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">Submit Bid</button>
                    : <span className="text-sm text-gray-400 italic">Invite only</span>
                  : appliedStatus
                    ? <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-2">
                        {appliedStatus === 'pending' ? 'In review' : appliedStatus.charAt(0).toUpperCase() + appliedStatus.slice(1)}
                      </span>
                    : <button onClick={() => setApplyOpen(true)} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Apply Now</button>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── Sections 2–7 ─────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 p-6 space-y-6">
          <Section title="Job Description"  content={job.description} />
          <Section title="Responsibilities" content={job.responsibilities} />
          <Section title="Requirements"     content={job.requirements} />

          {/* Skills as tags */}
          {job.skills?.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(s => (
                  <span key={s} className="bg-blue-50 text-blue-700 border border-blue-200 text-sm px-3 py-1">{s}</span>
                ))}
              </div>
            </div>
          )}

          <Section title="Nice to Have"     content={job.niceToHave} />
          <Section title="Benefits"         content={job.benefits} />
        </div>

        {/* ── 8. About the Company ─────────────────────────────────────── */}
        {job.company?.description && (
          <div className="bg-white border border-gray-200 p-6 mt-4">
            <div className="flex items-center gap-3 mb-3">
              {logoSrc && <img src={logoSrc} alt={job.company.name} className="w-10 h-10 object-contain border border-gray-100" />}
              <h3 className="text-base font-semibold text-gray-900">About {job.company.name}</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{job.company.description}</p>
            {job.company.website && (
              <a href={job.company.website} target="_blank" rel="noreferrer"
                className="text-sm text-blue-600 hover:underline mt-2 inline-block">{job.company.website}</a>
            )}
          </div>
        )}

      {bidOpen   && <BidModal job={job} onSubmit={submitBid} onClose={() => setBidOpen(false)} />}
      {applyOpen && <ApplicationForm job={job} onSubmit={submitApplication} onClose={() => setApplyOpen(false)} />}
      {gateOpen  && (
        <FreelanceModeGate
          onActivate={async () => {
            await candidateService.setFreelanceMode(true);
            setFreelanceActive(true);
            setGateOpen(false);
            setBidOpen(true);
          }}
          onCancel={() => setGateOpen(false)}
        />
      )}
    </PageShell>
  );
}
