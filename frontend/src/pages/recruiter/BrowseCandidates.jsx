import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import api from '../../services/api';
import freelanceService from '../../services/freelanceService';
import { useDebounce } from '../../hooks/useDebounce';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';
const PAGE_SIZE = 18;

const TINTS = [
  'bg-blue-500', 'bg-indigo-500', 'bg-emerald-500',
  'bg-violet-500', 'bg-amber-500', 'bg-teal-500',
  'bg-rose-500', 'bg-cyan-500',
];

function tint(name) {
  const n = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return TINTS[n % TINTS.length];
}

function initials(first, last) {
  return [first?.[0], last?.[0]].filter(Boolean).join('').toUpperCase() || '?';
}

// ── Candidate card ────────────────────────────────────────────────────────────
function CandidateCard({ candidate, onView, onMessage, onInvite, messageBusy }) {
  const c = candidate;
  const id = c._id ?? c.id;
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ');

  return (
    <div className="page-shell-card rounded-xl p-4 flex flex-col gap-3">
      {/* Top row: avatar + name + badges */}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${tint(name)} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
          {initials(c.firstName, c.lastName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{name || '—'}</p>
          {c.headline && <p className="text-xs text-blue-600 truncate mt-0.5">{c.headline}</p>}
          {c.location && <p className="text-xs text-gray-400 mt-0.5">{c.location}</p>}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {c.freelanceActive && (
            <span className="text-[10px] font-medium bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
              Freelance
            </span>
          )}
          {c.yearsExperience != null && (
            <span className="text-[10px] text-gray-400">{c.yearsExperience}y exp</span>
          )}
        </div>
      </div>

      {/* Skills */}
      {c.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {c.skills.slice(0, 5).map(s => (
            <span key={s.skillId ?? s.name} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {s.name}
            </span>
          ))}
          {c.skills.length > 5 && <span className="text-[11px] text-gray-400">+{c.skills.length - 5}</span>}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <button
          onClick={() => onView(c)}
          className="flex-1 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          View Profile
        </button>
        <button
          onClick={() => onMessage(id)}
          disabled={messageBusy === id}
          className="flex-1 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {messageBusy === id ? '…' : 'Message'}
        </button>
        {c.freelanceActive && (
          <button
            onClick={() => onInvite(c)}
            title="Invite to job"
            className="py-1.5 px-2 text-xs border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Invite
          </button>
        )}
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="page-shell-card rounded-xl p-4 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-1 mb-3">
        {[1,2,3].map(i => <div key={i} className="h-4 w-14 bg-gray-200 rounded" />)}
      </div>
      <div className="pt-2 border-t border-gray-100 flex gap-2">
        <div className="flex-1 h-7 bg-gray-200 rounded-lg" />
        <div className="flex-1 h-7 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

// ── Profile modal ─────────────────────────────────────────────────────────────
function ProfileModal({ candidate: c, onClose, onMessage, onInvite, messageBusy }) {
  if (!c) return null;
  const id = c._id ?? c.id;
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/75 px-4" onMouseDown={onClose}>
      <div
        className="bg-white w-full max-w-2xl rounded-xl border border-gray-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${tint(name)} flex items-center justify-center text-white font-semibold`}>
              {initials(c.firstName, c.lastName)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
                {c.freelanceActive && (
                  <span className="text-[11px] font-medium bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Freelance</span>
                )}
              </div>
              {c.headline && <p className="text-sm text-blue-600">{c.headline}</p>}
              {c.location && <p className="text-xs text-gray-500">{c.location}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none flex-shrink-0">&times;</button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Experience', value: c.yearsExperience != null ? `${c.yearsExperience} yrs` : '—' },
              { label: 'Skills', value: c.stats?.skillsListed ?? c.skills?.length ?? 0 },
              { label: 'Jobs worked', value: c.stats?.workExperiences ?? c.experiences?.length ?? 0 },
              { label: 'Education', value: c.stats?.educationRecords ?? c.educations?.length ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg px-3 py-2 text-center border border-gray-100">
                <p className="text-lg font-bold text-gray-900">{value}</p>
                <p className="text-[11px] text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {c.email && <div><span className="text-xs font-semibold text-gray-400 block">Email</span><span className="text-gray-700">{c.email}</span></div>}
            {c.phone && <div><span className="text-xs font-semibold text-gray-400 block">Phone</span><span className="text-gray-700">{c.phone}</span></div>}
            {c.willingToRelocate != null && (
              <div>
                <span className="text-xs font-semibold text-gray-400 block">Willing to relocate</span>
                <span className={c.willingToRelocate ? 'text-green-600 font-medium' : 'text-gray-700'}>
                  {c.willingToRelocate ? 'Yes' : 'No'}
                </span>
              </div>
            )}
            {c.linkedinUrl && (
              <div>
                <span className="text-xs font-semibold text-gray-400 block">LinkedIn</span>
                <a href={c.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block">{c.linkedinUrl}</a>
              </div>
            )}
            {c.githubUrl && (
              <div>
                <span className="text-xs font-semibold text-gray-400 block">GitHub</span>
                <a href={c.githubUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block">{c.githubUrl}</a>
              </div>
            )}
          </div>

          {c.bio && (
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-1">About</span>
              <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3 leading-relaxed">{c.bio}</p>
            </div>
          )}

          {c.cvPath && (
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-1">CV / Resume</span>
              <a href={`${API_BASE}${c.cvPath}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View CV
              </a>
            </div>
          )}

          {c.skills?.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-2">Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {c.skills.map(s => (
                  <span key={s.skillId ?? s.name} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                    {s.name}{s.level ? ` · ${s.level}` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {c.experiences?.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-2">Experience</span>
              <div className="space-y-2">
                {c.experiences.map((exp, i) => (
                  <div key={exp.id ?? i} className="border border-gray-100 rounded-lg p-3">
                    <p className="font-medium text-gray-900 text-sm">{exp.title}</p>
                    <p className="text-xs text-gray-500">{exp.company}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {exp.startDate ? new Date(exp.startDate).getFullYear() : '?'} — {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                    </p>
                    {exp.description && <p className="text-xs text-gray-600 mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {c.educations?.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-2">Education</span>
              <div className="space-y-2">
                {c.educations.map((edu, i) => (
                  <div key={edu.id ?? i} className="border border-gray-100 rounded-lg p-3">
                    <p className="font-medium text-gray-900 text-sm">{edu.degree}</p>
                    <p className="text-xs text-gray-500">{edu.institution}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{edu.startYear} — {edu.endYear ?? 'Present'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => onMessage(id)}
              disabled={messageBusy === id}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {messageBusy === id ? 'Opening…' : 'Message'}
            </button>
            {c.freelanceActive && (
              <button
                onClick={() => { onClose(); onInvite(c); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Invite to Job
              </button>
            )}
          </div>
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Invite modal ──────────────────────────────────────────────────────────────
function InviteModal({ candidate, jobs, onClose, onSent }) {
  const [jobId,   setJobId]   = useState('');
  const [note,    setNote]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const send = async () => {
    if (!jobId) { setError('Please select a job.'); return; }
    setLoading(true);
    setError('');
    try {
      await freelanceService.sendInvitation({
        candidateId: candidate._id ?? candidate.id,
        jobId: Number(jobId),
        note: note.trim() || undefined,
      });
      onSent();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to send invitation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/75 px-4" onMouseDown={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-xl border border-gray-200 shadow-2xl overflow-hidden"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="font-semibold text-gray-900">Invite {candidate.firstName} to a job</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Select job *</label>
            <select
              value={jobId}
              onChange={e => setJobId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">— Choose a job —</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Personal note (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Hi! We think you'd be a great fit for…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
          <button
            onClick={send}
            disabled={loading || !jobId}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send invitation'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BrowseCandidates() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  const [q,               setQ]              = useState('');
  const [skillsInput,     setSkillsInput]     = useState('');
  const [location,        setLocation]        = useState('');
  const [freelanceOnly,   setFreelanceOnly]   = useState(false);

  const debouncedQ        = useDebounce(q,           350);
  const debouncedSkills   = useDebounce(skillsInput, 350);
  const debouncedLocation = useDebounce(location,    350);

  const [viewing,     setViewing]     = useState(null);
  const [inviting,    setInviting]    = useState(null);
  const [messageBusy, setMessageBusy] = useState(null);
  const [inviteSent,  setInviteSent]  = useState('');

  const [recruiterJobs, setRecruiterJobs] = useState([]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    api.get('/recruiter/jobs', { params: { status: 'open', limit: 200 } })
      .then(r => setRecruiterJobs(r.data?.data ?? []))
      .catch(() => {});
  }, []);

  const load = useCallback(async (pg = page) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: pg,
        limit: PAGE_SIZE,
        ...(debouncedQ        && { q: debouncedQ }),
        ...(debouncedSkills   && { skills: debouncedSkills }),
        ...(debouncedLocation && { location: debouncedLocation }),
        ...(freelanceOnly     && { freelanceActive: 'true' }),
      };
      const res = await api.get('/recruiter/candidates', { params });
      setCandidates(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch {
      setError('Failed to load candidates.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, debouncedSkills, debouncedLocation, freelanceOnly, page]);

  useEffect(() => { setPage(1); }, [debouncedQ, debouncedSkills, debouncedLocation, freelanceOnly]);
  useEffect(() => { load(page); }, [debouncedQ, debouncedSkills, debouncedLocation, freelanceOnly, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMessage = async (candidateId) => {
    setMessageBusy(candidateId);
    try {
      await api.post('/conversations', { recipientId: candidateId });
      navigate('/chat');
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Could not start conversation.');
      setMessageBusy(null);
    }
  };

  const handleInviteSent = () => {
    setInviting(null);
    setInviteSent(`Invitation sent to ${inviting?.firstName}!`);
    setTimeout(() => setInviteSent(''), 4000);
  };

  return (
    <RecruiterLayout title="Browse Candidates">

      {/* Header + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">Browse Candidates</h1>
          {!loading && (
            <p className="text-sm text-gray-500">{total.toLocaleString()} candidate{total !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="page-shell-card rounded-xl p-3 mb-5 flex flex-wrap gap-2 items-center">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Name or headline"
          className="page-shell-field px-3 py-2 text-sm text-gray-700 rounded-lg focus:outline-none flex-1 min-w-[140px]"
        />
        <input
          value={skillsInput}
          onChange={e => setSkillsInput(e.target.value)}
          placeholder="Skills (e.g. React, Node)"
          className="page-shell-field px-3 py-2 text-sm text-gray-700 rounded-lg focus:outline-none flex-1 min-w-[160px]"
        />
        <input
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Location"
          className="page-shell-field px-3 py-2 text-sm text-gray-700 rounded-lg focus:outline-none flex-1 min-w-[120px]"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none px-1">
          <input
            type="checkbox"
            checked={freelanceOnly}
            onChange={e => setFreelanceOnly(e.target.checked)}
            className="h-4 w-4 accent-teal-600"
          />
          Freelance only
        </label>
        {(q || skillsInput || location || freelanceOnly) && (
          <button
            onClick={() => { setQ(''); setSkillsInput(''); setLocation(''); setFreelanceOnly(false); }}
            className="text-xs text-gray-500 hover:text-gray-800 px-2"
          >
            Clear
          </button>
        )}
      </div>

      {inviteSent && (
        <div className="mb-4 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
          {inviteSent}
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : candidates.length === 0 ? (
        <div className="page-shell-card rounded-xl text-center py-16 text-gray-400">
          <p className="text-base font-medium text-gray-700">No candidates found</p>
          <p className="text-sm mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {candidates.map(c => (
              <CandidateCard
                key={c._id ?? c.id}
                candidate={c}
                onView={setViewing}
                onMessage={handleMessage}
                onInvite={setInviting}
                messageBusy={messageBusy}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-500">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {viewing && (
        <ProfileModal
          candidate={viewing}
          onClose={() => setViewing(null)}
          onMessage={handleMessage}
          onInvite={c => { setViewing(null); setInviting(c); }}
          messageBusy={messageBusy}
        />
      )}

      {inviting && (
        <InviteModal
          candidate={inviting}
          jobs={recruiterJobs}
          onClose={() => setInviting(null)}
          onSent={handleInviteSent}
        />
      )}
    </RecruiterLayout>
  );
}
