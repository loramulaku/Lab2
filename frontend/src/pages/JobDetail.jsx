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
      <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-blue-500" aria-hidden />
        {title}
      </h3>
      <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed pl-3">{content}</div>
    </div>
  );
}

// One labelled row in the sticky "at a glance" sidebar.
function Fact({ icon, label, value, valueClass = 'text-gray-900' }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-blue-100/60 last:border-0">
      <span className="text-blue-500 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">{label}</p>
        <p className={`text-sm font-medium ${valueClass} break-words`}>{value}</p>
      </div>
    </div>
  );
}

const FactIcon = ({ d }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);
const ICON_MONEY    = 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m0-8c1.11 0 2.08.402 2.599 1M12 8c-1.11 0-2.08.402-2.599 1';
const ICON_BRIEF    = 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';
const ICON_HOME     = 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6';
const ICON_CHART    = 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z';
const ICON_CAL      = 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';

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

  // Apply / Bid / status action — rendered inside the sticky sidebar.
  const actionEl = feedback ? (
    <span className={`block text-center text-sm font-medium ${feedback.ok ? 'text-green-600' : 'text-red-600'}`}>{feedback.msg}</span>
  ) : !user ? (
    <Link to="/login" className="block w-full text-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Sign in to apply</Link>
  ) : isCandidate ? (
    isFreelance
      ? canBid
        ? hasBid
          ? <span className="block text-center text-sm text-gray-500 bg-gray-100 rounded-lg px-3 py-2.5">Bid submitted</span>
          : <button onClick={handleBidClick} className="w-full px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">Submit Bid</button>
        : <span className="block text-center text-sm text-gray-400 italic px-3 py-2.5">Invite only</span>
      : appliedStatus
        ? <span className="block text-center text-sm font-medium text-gray-500 bg-gray-100 rounded-lg px-3 py-2.5">
            {appliedStatus === 'pending' ? 'In review' : appliedStatus.charAt(0).toUpperCase() + appliedStatus.slice(1)}
          </span>
        : <button onClick={() => setApplyOpen(true)} className="w-full px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Apply Now</button>
  ) : null;

  const typeLabel = isFreelance ? 'Freelance' : job.employmentType?.replace(/-/g, '‑');
  const salaryVal = (job.budgetMin || job.budgetMax)
    ? `$${Number(job.budgetMin ?? 0).toLocaleString()}–$${Number(job.budgetMax ?? 0).toLocaleString()}${isFreelance ? '' : '/yr'}`
    : null;
  const expLabel = job.experienceLevel ? job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1) : null;

  return (
    <PageShell width="lg" mainClassName="pb-12">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1">
          ← Back to results
        </button>

        <div className="grid lg:grid-cols-3 gap-5 items-start">
          {/* ── Main column ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Overview header */}
            <div className="page-shell-card rounded-xl p-6">
              <div className="flex gap-4 items-start">
                {logoSrc
                  ? <img src={logoSrc} alt={job.company?.name} loading="lazy" className="w-16 h-16 object-contain border border-gray-100 bg-white rounded-xl flex-shrink-0" />
                  : (
                    <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg bg-blue-600 rounded-xl">
                      {(job.company?.name ?? '?').slice(0, 2).toUpperCase()}
                    </div>
                  )
                }
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-base text-gray-600 mt-0.5">{job.company?.name}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    {job.company?.location && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        {job.company.location}
                      </span>
                    )}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE[job.employmentType] ?? 'bg-gray-100 text-gray-700'}`}>
                      {typeLabel}
                    </span>
                  </div>
                  {job.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {job.categories.map(c => (
                        <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bookmark */}
                {isCandidate && (
                  <button onClick={toggleSave} title={isSaved ? 'Remove bookmark' : 'Save job'}
                    className={`flex-shrink-0 transition ${isSaved ? 'text-blue-600' : 'text-gray-300 hover:text-gray-500'}`}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Description & detail sections */}
            <div className="page-shell-card rounded-xl p-6 space-y-6">
              <Section title="Job Description"  content={job.description} />
              <Section title="Responsibilities" content={job.responsibilities} />
              <Section title="Requirements"     content={job.requirements} />

              {/* Skills as tags */}
              {job.skills?.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full bg-blue-500" aria-hidden />
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2 pl-3">
                    {job.skills.map(s => (
                      <span key={s} className="bg-blue-50 text-blue-700 border border-blue-200 text-sm px-3 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <Section title="Nice to Have"     content={job.niceToHave} />
              <Section title="Benefits"         content={job.benefits} />
            </div>

            {/* About the company */}
            {job.company?.description && (
              <div className="page-shell-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  {logoSrc && <img src={logoSrc} alt={job.company.name} loading="lazy" className="w-10 h-10 object-contain border border-gray-100 rounded-lg" />}
                  <h3 className="text-base font-semibold text-gray-900">About {job.company.name}</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{job.company.description}</p>
                {job.company.website && (
                  <a href={job.company.website} target="_blank" rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block">{job.company.website}</a>
                )}
              </div>
            )}
          </div>

          {/* ── Sticky summary sidebar ────────────────────────────────── */}
          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="page-shell-card rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">At a glance</h3>
              <div className="mb-4">
                <Fact icon={<FactIcon d={ICON_MONEY} />} label="Compensation" value={salaryVal} valueClass="text-blue-700" />
                <Fact icon={<FactIcon d={ICON_BRIEF} />} label="Employment"   value={typeLabel} />
                <Fact icon={<FactIcon d={ICON_HOME} />}  label="Work mode"    value={!isFreelance ? job.workMode : null} />
                <Fact icon={<FactIcon d={ICON_CHART} />} label="Experience"   value={expLabel} />
                <Fact icon={<FactIcon d={ICON_CAL} />}   label="Schedule"     value={sched} valueClass="text-purple-700" />
              </div>
              {actionEl}
            </div>
          </aside>
        </div>

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
