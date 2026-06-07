import { useEffect, useState } from 'react';
import api from '../../services/api';

/**
 * Compact 2-column Job form.
 *
 * Step 0  — Standard Employment | Freelance type picker
 * Step 1A — Standard: Employment sub-type · Work mode · Title · Budget · Schedule (internship only)
 * Step 1B — Freelance: Mode tabs (Bid A | Invite B | Both C) · Title · Budget · Invite section
 *
 * Stable sections: conditional blocks are rendered-but-invisible (not unmounted)
 * so the layout never shifts when the user switches sub-types or modes.
 */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STD_SUBTYPES = [
  { value: 'full-time',  label: 'Full-time' },
  { value: 'part-time',  label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
];

const WORK_MODES = [
  { value: 'remote',  label: 'Remote' },
  { value: 'on-site', label: 'On-site' },
  { value: 'hybrid',  label: 'Hybrid' },
];

const EXPERIENCE_LEVELS = [
  { value: '',       label: 'Any' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid',    label: 'Mid' },
  { value: 'senior', label: 'Senior' },
];

const FREELANCE_MODES = [
  { value: 'public', label: 'Bid',    tag: 'A', desc: 'Post publicly — freelancers browse and submit bids with their price and timeline.' },
  { value: 'invite', label: 'Invite', tag: 'B', desc: 'Search the freelancer pool and send direct invitations yourself.' },
  { value: 'both',   label: 'Both',   tag: 'C', desc: 'Public bids AND direct invitations run in parallel.' },
];

const DEFAULT_SCHEDULE = { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '09:00', endTime: '17:00' };

const EMPTY = {
  title: '',
  description: '',
  employmentType: 'full-time',
  workMode: 'remote',
  jobMode: 'public',
  experienceLevel: '',
  budgetMin: '',
  budgetMax: '',
  categoryId: '',
  responsibilities: '',
  requirements: '',
  niceToHave: '',
  benefits: '',
  schedule: { ...DEFAULT_SCHEDULE },
};

function Pill({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-1 text-xs font-medium border transition ${
        active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
      }`}>
      {children}
    </button>
  );
}

const inputCls = 'w-full border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

export default function JobFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  title = 'Post a New Job',
  submitting = false,
  hasSubscription = null,
  invitees = [],
  onBrowseFreelancers,
}) {
  const [step,          setStep]          = useState(0);
  const [topType,       setTopType]       = useState(null);
  const [form,          setForm]          = useState(EMPTY);
  const [error,         setError]         = useState('');
  const [localInvitees, setLocalInvitees] = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [detailsOpen,   setDetailsOpen]   = useState(false);

  // Load categories once (or whenever modal opens the first time)
  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    setError('');
    setDetailsOpen(false);
    setLocalInvitees(invitees);
    if (initial) {
      const isF = initial.workMode === 'freelance' || initial.employmentType === 'freelance';
      setTopType(isF ? 'freelance' : 'standard');
      setStep(1);
      setForm({
        ...EMPTY,
        ...initial,
        workMode:        isF ? 'freelance' : (initial.workMode       ?? 'remote'),
        employmentType:  isF ? 'freelance' : (initial.employmentType ?? 'full-time'),
        schedule:        initial.schedule ?? { ...DEFAULT_SCHEDULE },
        categoryId:      initial.categoryId ?? '',
        responsibilities: initial.responsibilities ?? '',
        requirements:    initial.requirements     ?? '',
        niceToHave:      initial.niceToHave       ?? '',
        benefits:        initial.benefits         ?? '',
      });
      if (initial.responsibilities || initial.requirements || initial.niceToHave || initial.benefits) {
        setDetailsOpen(true);
      }
    } else {
      setTopType(null);
      setStep(0);
      setForm(EMPTY);
    }
  }, [open, initial, invitees]);

  if (!open) return null;

  const set    = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setVal = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleDay = (day) => setForm(p => {
    const days = p.schedule?.days ?? [];
    return { ...p, schedule: { ...p.schedule, days: days.includes(day) ? days.filter(d => d !== day) : [...days, day] } };
  });
  const setTime = (key, val) => setForm(p => ({ ...p, schedule: { ...p.schedule, [key]: val } }));

  const pickTopType = (t) => {
    setTopType(t);
    setForm(t === 'freelance'
      ? { ...EMPTY, employmentType: 'freelance', workMode: 'freelance', jobMode: 'public' }
      : { ...EMPTY, employmentType: 'full-time', workMode: 'remote',    jobMode: null });
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    setError('');
    try {
      await onSubmit({
        title:           form.title.trim(),
        description:     form.description.trim(),
        employmentType:  form.employmentType,
        workMode:        form.workMode,
        jobMode:         topType === 'freelance' ? form.jobMode : null,
        experienceLevel: form.experienceLevel || null,
        budgetMin:       form.budgetMin !== '' ? Number(form.budgetMin) : null,
        budgetMax:       form.budgetMax !== '' ? Number(form.budgetMax) : null,
        categoryId:      form.categoryId !== '' ? Number(form.categoryId) : null,
        responsibilities: form.responsibilities.trim() || null,
        requirements:    form.requirements.trim()     || null,
        niceToHave:      form.niceToHave.trim()       || null,
        benefits:        form.benefits.trim()         || null,
        schedule:        (!isFreelance && form.employmentType === 'internship') ? form.schedule : null,
        invitees:        localInvitees,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save job.');
    }
  };

  const browseFreelancers = () => onBrowseFreelancers?.({ ...form, _topType: topType });
  const removeInvitee = (id) => setLocalInvitees(prev => prev.filter(x => String(x._id ?? x.id) !== String(id)));

  // ── Step 0 ─────────────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/75 px-4" onMouseDown={onClose}>
        <div className="bg-white w-full max-w-lg border border-gray-200 shadow-xl" onMouseDown={e => e.stopPropagation()}>
          <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>
          <div className="p-5">
            {hasSubscription === false && (
              <div className="flex items-start gap-2 border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>Subscription required — <a href="/recruiter/billing/upgrade" className="font-semibold underline">choose a plan</a> to post.</span>
              </div>
            )}
            <p className="text-xs text-gray-500 mb-3">What kind of role are you hiring for?</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => pickTopType('standard')}
                className="border-2 border-gray-200 p-4 text-left hover:border-blue-500 hover:bg-blue-50/40 transition group">
                <div className="w-7 h-7 bg-blue-100 flex items-center justify-center mb-2.5 group-hover:bg-blue-200 transition">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 text-sm mb-0.5">Standard Employment</p>
                <p className="text-xs text-gray-500">Full-time, part-time, or internship. Candidates apply through your pipeline.</p>
              </button>
              <button type="button" onClick={() => pickTopType('freelance')}
                className="border-2 border-gray-200 p-4 text-left hover:border-indigo-500 hover:bg-indigo-50/40 transition group">
                <div className="w-7 h-7 bg-indigo-100 flex items-center justify-center mb-2.5 group-hover:bg-indigo-200 transition">
                  <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 text-sm mb-0.5">Freelance</p>
                <p className="text-xs text-gray-500">Project-based. Receive bids, invite freelancers, or both.</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 1 ─────────────────────────────────────────────────────────────────
  const isFreelance   = topType === 'freelance';
  const activeMode    = FREELANCE_MODES.find(m => m.value === form.jobMode);
  const showInviteeUI = isFreelance && (form.jobMode === 'invite' || form.jobMode === 'both') && !!onBrowseFreelancers;
  const showSchedule  = !isFreelance && form.employmentType === 'internship';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/75 px-4" onMouseDown={onClose}>
      <div className="bg-white w-full max-w-2xl border border-gray-200 shadow-xl flex flex-col max-h-[88vh]"
        onMouseDown={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex-shrink-0 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {!initial && (
              <button type="button" onClick={() => { setStep(0); setError(''); }}
                className="text-gray-400 hover:text-gray-700 text-xs whitespace-nowrap">← Back</button>
            )}
            <h3 className="font-semibold text-gray-900 text-sm truncate">{title}</h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs font-medium px-2 py-0.5 border ${
              isFreelance ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>{isFreelance ? 'Freelance' : 'Standard'}</span>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-1">×</button>
          </div>
        </div>

        {hasSubscription === false && (
          <div className="flex-shrink-0 flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-5 py-2 text-xs text-amber-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>Subscription required — <a href="/recruiter/billing/upgrade" className="font-semibold underline">choose a plan</a>.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            {/* Freelance: horizontal mode tabs */}
            {isFreelance && (
              <div>
                <p className={labelCls}>Hiring Mode</p>
                <div className="flex border border-gray-200">
                  {FREELANCE_MODES.map((m, i) => (
                    <button key={m.value} type="button" onClick={() => setVal('jobMode', m.value)}
                      className={`flex-1 py-2 px-3 text-xs font-medium transition flex items-center justify-center gap-1.5
                        ${i !== 0 ? 'border-l border-gray-200' : ''}
                        ${form.jobMode === m.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                      <span>{m.label}</span>
                      <span className={`text-[10px] font-bold px-1 py-0.5 ${
                        form.jobMode === m.value ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>{m.tag}</span>
                    </button>
                  ))}
                </div>
                {activeMode && <p className="text-xs text-gray-500 mt-1.5">{activeMode.desc}</p>}
              </div>
            )}

            {/* Standard: employment type + work mode */}
            {!isFreelance && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={labelCls}>Employment Type</p>
                  <div className="flex gap-1.5">
                    {STD_SUBTYPES.map(t => (
                      <Pill key={t.value} active={form.employmentType === t.value} onClick={() => setVal('employmentType', t.value)}>
                        {t.label}
                      </Pill>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={labelCls}>Work Mode</p>
                  <div className="flex gap-1.5">
                    {WORK_MODES.map(m => (
                      <Pill key={m.value} active={form.workMode === m.value} onClick={() => setVal('workMode', m.value)}>
                        {m.label}
                      </Pill>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Experience required — applies to both standard and freelance roles */}
            <div>
              <p className={labelCls}>Experience Required</p>
              <div className="flex gap-1.5">
                {EXPERIENCE_LEVELS.map(l => (
                  <Pill key={l.value} active={form.experienceLevel === l.value}
                    onClick={() => setVal('experienceLevel', l.value)}>
                    {l.label}
                  </Pill>
                ))}
              </div>
            </div>

            {/* 2-column main grid */}
            <div className="grid grid-cols-2 gap-x-5 items-stretch">
              {/* Left column — stable height (conditional sections use invisible, not unmount) */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className={labelCls}>Job Title <span className="text-red-500">*</span></label>
                  <input value={form.title} onChange={set('title')} className={inputCls}
                    placeholder={isFreelance ? 'e.g. Build a REST API in Node.js' : 'e.g. Senior Frontend Developer'} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>{isFreelance ? 'Budget Min ($)' : 'Salary Min ($)'}</label>
                    <input type="number" min="0" value={form.budgetMin} onChange={set('budgetMin')} className={inputCls} placeholder="e.g. 3000" />
                  </div>
                  <div>
                    <label className={labelCls}>{isFreelance ? 'Budget Max ($)' : 'Salary Max ($)'}</label>
                    <input type="number" min="0" value={form.budgetMax} onChange={set('budgetMax')} className={inputCls} placeholder="e.g. 5000" />
                  </div>
                </div>

                {/* Category */}
                {categories.length > 0 && (
                  <div>
                    <label className={labelCls}>Category</label>
                    <select value={form.categoryId} onChange={set('categoryId')} className={inputCls}>
                      <option value="">— No category —</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* ── Internship schedule (stable — invisible when not internship) ── */}
                <div className={`border border-gray-200 p-3 transition-opacity ${showSchedule ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  style={{ minHeight: '108px' }}>
                  <p className={labelCls}>Weekly Schedule</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {DAYS.map(d => (
                      <button key={d} type="button"
                        onClick={() => toggleDay(d)}
                        className={`text-[11px] px-1.5 py-0.5 border transition ${
                          (form.schedule?.days ?? []).includes(d)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-600 hover:border-gray-400'
                        }`}>
                        {d}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="time" value={form.schedule?.startTime ?? '09:00'}
                      onChange={e => setTime('startTime', e.target.value)}
                      className="border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <span className="text-xs text-gray-400">to</span>
                    <input type="time" value={form.schedule?.endTime ?? '17:00'}
                      onChange={e => setTime('endTime', e.target.value)}
                      className="border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>

                {/* ── Invite section (stable — invisible when not invite/both mode) ── */}
                <div className={`border border-indigo-200 bg-indigo-50/30 px-3 py-2.5 space-y-2 transition-opacity ${
                  (isFreelance && showInviteeUI) ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`} style={{ minHeight: '76px' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">
                      Freelancers to invite
                      {localInvitees.length > 0 && (
                        <span className="ml-1.5 text-indigo-700 bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold">{localInvitees.length}</span>
                      )}
                    </span>
                    <button type="button" onClick={browseFreelancers}
                      className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white text-[11px] font-medium hover:bg-indigo-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Browse
                    </button>
                  </div>
                  {localInvitees.length === 0 ? (
                    <p className="text-[11px] text-gray-400">No freelancers selected. Click Browse to pick from the pool.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {localInvitees.map(f => {
                        const id = String(f._id ?? f.id);
                        return (
                          <span key={id} className="flex items-center gap-1 bg-white border border-indigo-300 text-indigo-800 text-[11px] px-2 py-0.5">
                            {f.firstName} {f.lastName}
                            <button type="button" onClick={() => removeInvitee(id)} className="text-indigo-400 hover:text-indigo-700 leading-none ml-0.5">×</button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right column — Description fills height */}
              <div className="flex flex-col">
                <label className={labelCls}>Description <span className="text-red-500">*</span></label>
                <textarea value={form.description} onChange={set('description')}
                  className={`${inputCls} flex-1 resize-none`} style={{ minHeight: '9rem' }}
                  placeholder={isFreelance
                    ? 'Describe the project scope, deliverables, and requirements…'
                    : 'Describe the role, responsibilities, and requirements…'} />
              </div>
            </div>

            {/* ── Collapsible: Detailed sections (optional) ────────────── */}
            <div className="border border-gray-200">
              <button type="button"
                onClick={() => setDetailsOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition">
                <span>+ Job Details — Responsibilities, Requirements, Benefits <span className="text-gray-400 font-normal">(optional)</span></span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {detailsOpen && (
                <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                  <div>
                    <label className={labelCls}>Responsibilities</label>
                    <textarea rows={3} value={form.responsibilities} onChange={set('responsibilities')}
                      className={`${inputCls} resize-none`}
                      placeholder="What will this person do day-to-day? (one per line or paragraphs)" />
                  </div>
                  <div>
                    <label className={labelCls}>Requirements (must-have)</label>
                    <textarea rows={3} value={form.requirements} onChange={set('requirements')}
                      className={`${inputCls} resize-none`}
                      placeholder="Required qualifications, experience, certifications…" />
                  </div>
                  <div>
                    <label className={labelCls}>Nice to Have (optional)</label>
                    <textarea rows={2} value={form.niceToHave} onChange={set('niceToHave')}
                      className={`${inputCls} resize-none`}
                      placeholder="Bonus skills or experience that would be great to have…" />
                  </div>
                  <div>
                    <label className={labelCls}>Benefits</label>
                    <textarea rows={2} value={form.benefits} onChange={set('benefits')}
                      className={`${inputCls} resize-none`}
                      placeholder="Health insurance, remote work, equity, paid leave…" />
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          {/* Footer — always pinned */}
          <div className="flex-shrink-0 border-t border-gray-100 px-5 py-3 flex items-center gap-3 bg-white">
            <button type="submit" disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Saving…' : 'Save Job'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
