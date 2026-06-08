import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import recruiterService from '../../services/recruiterService';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';

const STATUS_OPTIONS = [
  { value: '',            label: 'All Statuses' },
  { value: 'pending',     label: 'Pending' },
  { value: 'in_review',   label: 'In Review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview',   label: 'Interview' },
  { value: 'offer',       label: 'Offer' },
  { value: 'accepted',    label: 'Accepted' },
  { value: 'rejected',    label: 'Rejected' },
  { value: 'withdrawn',   label: 'Withdrawn' },
];

const lc = (s) => (s ?? '').toLowerCase();

export default function JobSeekers() {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [showApp, setShowApp]       = useState(null);

  // ── Search state ──────────────────────────────────────────────────────────
  const [nameQ,   setNameQ]   = useState('');
  const [titleQ,  setTitleQ]  = useState('');
  const [statusQ, setStatusQ] = useState('');

  const visible = applicants.filter(a => {
    const fullName = `${lc(a.applicant?.firstName)} ${lc(a.applicant?.lastName)}`;
    if (nameQ   && !fullName.includes(lc(nameQ)))                             return false;
    if (titleQ  && !lc(a.jobTitle).includes(lc(titleQ)))                      return false;
    if (statusQ && a.status !== statusQ)                                       return false;
    return true;
  });

  const hasFilter = nameQ || titleQ || statusQ;

  // ── Data loading ──────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await recruiterService.getApplicants({ limit: 200 });
      setApplicants(res.data ?? []);
    } catch {
      setError('Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <RecruiterLayout title="Job Seekers">

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 p-4 mb-6 grid md:grid-cols-3 gap-3">
        <input
          type="text"
          value={nameQ}
          onChange={e => setNameQ(e.target.value)}
          placeholder="Candidate name…"
          className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={titleQ}
          onChange={e => setTitleQ(e.target.value)}
          placeholder="Job title…"
          className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusQ}
          onChange={e => setStatusQ(e.target.value)}
          className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : applicants.length === 0 ? (
        <div className="bg-white border border-gray-200 text-center py-16 text-gray-400">
          <p className="text-lg">No applicants yet</p>
          <p className="text-sm mt-1">Candidates who apply to your standard-employment jobs appear here.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-gray-200 text-center py-10 text-gray-400">
          <p className="text-base">No results match your search</p>
          {hasFilter && (
            <button
              onClick={() => { setNameQ(''); setTitleQ(''); setStatusQ(''); }}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3">
            {visible.length} of {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-3">
            {visible.map(a => (
              <div key={a.id} className="bg-white border border-gray-200 px-5 py-4 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    {a.applicant?.firstName} {a.applicant?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    <span className="font-medium text-gray-700">{a.jobTitle ?? '—'}</span>
                    {' · '}{a.applicant?.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Applied {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                  <button
                    onClick={() => setShowApp(a)}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 whitespace-nowrap">
                    View Application
                  </button>
                  <button
                    onClick={() => navigate(`/chat?userId=${a.userId}`)}
                    className="px-3 py-1.5 bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 whitespace-nowrap">
                    Live Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showApp && (
        <ApplicationDetailModal app={showApp} onClose={() => setShowApp(null)} />
      )}
    </RecruiterLayout>
  );
}

function Field({ label, value, className = '' }) {
  return (
    <div>
      <span className="text-xs font-semibold text-gray-400 block mb-0.5">{label}</span>
      <span className={`text-sm text-gray-800 ${className}`}>{value}</span>
    </div>
  );
}

function ApplicationDetailModal({ app, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/75 px-4" onMouseDown={onClose}>
      <div
        className="bg-white w-full max-w-2xl rounded-xl border border-gray-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="font-semibold text-gray-900">
              {app.applicant?.firstName} {app.applicant?.lastName}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {app.applicant?.email} · {app.jobTitle}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Applied" value={app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'} />
            <Field label="Phone" value={app.phone ?? '—'} />
            <Field
              label="Years of Experience"
              value={app.yearsExperience != null ? `${app.yearsExperience} yr${app.yearsExperience !== 1 ? 's' : ''}` : '—'}
            />
            <Field
              label="Expected Salary"
              value={app.expectedSalary != null ? `$${Number(app.expectedSalary).toLocaleString()}` : '—'}
            />
            <Field label="Available From" value={app.availableFrom ?? '—'} />
            <Field
              label="Willing to Relocate"
              value={app.willingToRelocate == null ? '—' : app.willingToRelocate ? 'Yes' : 'No'}
              className={app.willingToRelocate ? 'text-green-600 font-medium' : ''}
            />
          </div>

          {app.cvPath && (
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-1">CV / Resume</span>
              <a
                href={`${API_BASE}${app.cvPath}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View CV
              </a>
            </div>
          )}

          {app.coverLetter && (
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-1">Cover Letter</span>
              <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
                {app.coverLetter}
              </p>
            </div>
          )}

          {Array.isArray(app.skillsSnapshot) && app.skillsSnapshot.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-2">Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {app.skillsSnapshot.map((s, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                    {typeof s === 'string' ? s : `${s.name}${s.level ? ` · ${s.level}` : ''}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {app.screeningAnswers && typeof app.screeningAnswers === 'object' && Object.keys(app.screeningAnswers).length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-2">Screening Answers</span>
              <div className="space-y-2">
                {Object.entries(app.screeningAnswers).map(([q, a]) => (
                  <div key={q} className="text-sm border border-gray-100 rounded p-2.5">
                    <p className="font-medium text-gray-700 mb-0.5">{q}</p>
                    <p className="text-gray-600">{String(a)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 text-right">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
