import { useEffect, useState, useCallback } from 'react';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import recruiterService from '../../services/recruiterService';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ROLE_OPTIONS = [
  'Recruiter',
  'Senior Recruiter',
  'Technical Recruiter',
  'Talent Acquisition Manager',
  'HR Business Partner',
  'People Operations Lead',
  'Engineering Hiring Manager',
  'Head of Talent',
];

function initials(first, last) {
  return [first?.[0], last?.[0]].filter(Boolean).join('').toUpperCase() || '?';
}

const TINTS = [
  'bg-blue-500','bg-indigo-500','bg-emerald-500',
  'bg-violet-500','bg-amber-500','bg-teal-500',
];
function tint(name) {
  const n = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return TINTS[n % TINTS.length];
}

function MemberCard({ member, isYou }) {
  const name = [member.firstName, member.lastName].filter(Boolean).join(' ') || member.email;
  return (
    <div className="page-shell-card rounded-xl px-5 py-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-full ${tint(name)} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
        {initials(member.firstName, member.lastName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-900 text-sm">{name}</p>
          {isYou && (
            <span className="text-[11px] font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">You</span>
          )}
          {!member.isActive && (
            <span className="text-[11px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{member.email}</p>
      </div>
      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full flex-shrink-0">
        {member.jobTitle || 'Recruiter'}
      </span>
    </div>
  );
}

function InviteModal({ companyName, onClose, onAdded }) {
  const [email,    setEmail]    = useState('');
  const [jobTitle, setJobTitle] = useState('Recruiter');
  const [custom,   setCustom]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const effectiveTitle = jobTitle === '__custom__' ? custom.trim() : jobTitle;

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!effectiveTitle) { setError('Please enter a job title.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/recruiter/team', { email: email.trim(), jobTitle: effectiveTitle });
      onAdded(res.data);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to add member.');
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
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Add team member</h3>
            <p className="text-xs text-gray-500 mt-0.5">{companyName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Email address *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-gray-400 mt-1">They must already have an account to be added.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Role / Job title *</label>
            <select
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              <option value="__custom__">Custom…</option>
            </select>
            {jobTitle === '__custom__' && (
              <input
                value={custom}
                onChange={e => setCustom(e.target.value)}
                placeholder="e.g. Campus Recruiter"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding…' : 'Add member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TeamMembers() {
  const { user }  = useAuth();
  const [profile, setProfile]   = useState(null);
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [success,   setSuccess]    = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, m] = await Promise.all([
        recruiterService.getProfile(),
        api.get('/recruiter/team').then(r => r.data),
      ]);
      setProfile(p);
      setMembers(m ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdded = (newMember) => {
    setMembers(prev => [...prev, newMember]);
    setShowInvite(false);
    setSuccess(`${newMember.firstName ?? newMember.email} has been added to the team.`);
    setTimeout(() => setSuccess(''), 4000);
  };

  const company = profile?.company;
  const roleBreakdown = members.reduce((acc, m) => {
    const t = m.jobTitle || 'Recruiter';
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <RecruiterLayout title="Team Members">
      {loading ? (
        <div className="grid lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
          </div>
          <div className="space-y-3">
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="h-24 bg-gray-200 rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left: member list ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {members.length} member{members.length !== 1 ? 's' : ''}
                </h2>
                {company?.name && (
                  <p className="text-sm text-gray-500 mt-0.5">{company.name}</p>
                )}
              </div>
              <button
                onClick={() => setShowInvite(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add member
              </button>
            </div>

            {success && (
              <div className="px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
                {success}
              </div>
            )}

            {members.length === 0 ? (
              <div className="page-shell-card rounded-xl py-16 text-center text-gray-400">
                <p className="text-base font-medium text-gray-600">No team members yet</p>
                <p className="text-sm mt-1">Add colleagues to collaborate on hiring.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map(m => (
                  <MemberCard
                    key={m.userId}
                    member={m}
                    isYou={m.userId === user?.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Right: company info + stats ───────────────────────────────── */}
          <div className="space-y-4">

            {/* Company card */}
            <div className="page-shell-card rounded-xl p-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Company</p>
              {company?.logoPath && (
                <img
                  src={company.logoPath}
                  alt={company.name}
                  className="w-12 h-12 rounded-lg object-contain border border-gray-100 mb-3"
                />
              )}
              <p className="font-bold text-gray-900 text-base">{company?.name ?? '—'}</p>
              {company?.industry && <p className="text-sm text-gray-500 mt-0.5">{company.industry}</p>}
              {company?.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 block truncate"
                >
                  {company.website}
                </a>
              )}
            </div>

            {/* Role breakdown */}
            {Object.keys(roleBreakdown).length > 0 && (
              <div className="page-shell-card rounded-xl p-5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Roles</p>
                <div className="space-y-2">
                  {Object.entries(roleBreakdown).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between gap-2">
                      <span className="text-sm text-gray-700 truncate">{role}</span>
                      <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tip */}
            <div className="page-shell-card rounded-xl p-5 border-dashed">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">How it works</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Members you add must already have an account. They'll get access to your company's jobs, pipelines, and applicants.
              </p>
            </div>
          </div>
        </div>
      )}

      {showInvite && (
        <InviteModal
          companyName={company?.name ?? 'Your company'}
          onClose={() => setShowInvite(false)}
          onAdded={handleAdded}
        />
      )}
    </RecruiterLayout>
  );
}
