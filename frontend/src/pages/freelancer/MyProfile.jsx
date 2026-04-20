import { useEffect, useRef, useState } from 'react';
import candidateService from '../../services/candidateService';

// ── Helpers ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';

function avatarSrc(path) {
  return path ? `${API_BASE}${path}` : null;
}

const LEVEL_DOTS   = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
const LEVELS       = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const SKILL_COLOR_MAP = {
  react:      'bg-green-100 text-green-700',
  'node.js':  'bg-green-100 text-green-700',
  nodejs:     'bg-green-100 text-green-700',
  typescript: 'bg-purple-100 text-purple-700',
  postgresql: 'bg-pink-100 text-pink-700',
  docker:     'bg-slate-100 text-slate-600',
  aws:        'bg-blue-100 text-blue-700',
};

function skillColor(name = '') {
  return SKILL_COLOR_MAP[name.toLowerCase()] ?? 'bg-indigo-100 text-indigo-700';
}

function DotRating({ level }) {
  const filled = LEVEL_DOTS[level] ?? 2;
  return (
    <span className="flex gap-1 items-center">
      {[1, 2, 3, 4].map(i => (
        <span key={i} className={`w-3 h-3 rounded-full ${i <= filled ? 'bg-blue-600' : 'bg-gray-200'}`} />
      ))}
    </span>
  );
}

function fmtDate(dateStr) {
  if (!dateStr) return 'Present';
  return dateStr.slice(0, 7); // "YYYY-MM"
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const BriefcaseIcon  = ({ cls = 'w-5 h-5' }) => <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-10-2h4v2h-4V5z"/></svg>;
const StarIcon       = ({ cls = 'w-5 h-5' }) => <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>;
const GradIcon       = ({ cls = 'w-5 h-5' }) => <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>;
const PencilIcon     = ({ cls = 'w-4 h-4' }) => <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>;
const TrashIcon      = ({ cls = 'w-4 h-4' }) => <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>;
const UploadIcon     = ({ cls = 'w-4 h-4' }) => <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>;
const LinkIcon       = ({ cls = 'w-4 h-4' }) => <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>;
const LocationIcon   = ({ cls = 'w-4 h-4' }) => <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const MailIcon       = ({ cls = 'w-4 h-4' }) => <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const UserCircleIcon = ({ cls = 'w-full h-full' }) => <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>;

const INPUT = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500';
const BTN_PRIMARY = 'bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-4 py-2 text-sm transition flex items-center gap-2';
const BTN_OUTLINE = 'border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md px-4 py-2 text-sm transition flex items-center gap-2';

// ── Profile Header Card ───────────────────────────────────────────────────────
function ProfileHeader({ profile, onSave, onAvatarUpload }) {
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({});
  const [formError, setFormError] = useState('');
  const fileRef                 = useRef();

  useEffect(() => {
    setForm({
      firstName: profile.firstName ?? '',
      lastName:  profile.lastName  ?? '',
      headline:  profile.headline  ?? '',
      location:  profile.location  ?? '',
      email:     profile.email     ?? '',
      bio:       profile.bio       ?? '',
    });
  }, [profile]);

  const handleSave = async () => {
    if (!form.firstName.trim()) {
      setFormError('Please fill all required fields');
      return;
    }
    setFormError('');
    await onSave(form);
    setEditing(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onAvatarUpload(file);
  };

  const fullName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
  const memberSince = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-CA') : '';
  const imgSrc = avatarSrc(profile.avatarPath);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-4">
      {!editing ? (
        /* ── View mode ── */
        <>
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden">
                {imgSrc
                  ? <img src={imgSrc} alt="avatar" className="w-full h-full object-cover" />
                  : <UserCircleIcon />}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700"
              >
                <PencilIcon cls="w-3 h-3" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{fullName || 'Your Name'}</h1>
                  {profile.headline && <p className="text-blue-600 font-medium mt-0.5">{profile.headline}</p>}
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                    {profile.location && <span className="flex items-center gap-1"><LocationIcon />{profile.location}</span>}
                    {profile.email    && <span className="flex items-center gap-1"><MailIcon />{profile.email}</span>}
                    {memberSince      && <span className="flex items-center gap-1"><UserCircleIcon cls="w-4 h-4" />Member since {memberSince}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="border border-gray-300 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">Candidate</span>
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                    <PencilIcon /> Edit
                  </button>
                </div>
              </div>
              {profile.bio && <p className="mt-3 text-sm text-gray-600 leading-relaxed">{profile.bio}</p>}
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button className={BTN_PRIMARY}><UploadIcon /> Upload Resume</button>
          </div>
        </>
      ) : (
        /* ── Edit mode ── */
        <>
          <div className="flex items-start gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden">
                {imgSrc ? <img src={imgSrc} alt="avatar" className="w-full h-full object-cover" /> : <UserCircleIcon />}
              </div>
              <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
                <PencilIcon cls="w-3 h-3" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="flex-1 grid grid-cols-2 gap-3">
              <input value={form.firstName} onChange={e => { setFormError(''); setForm(p => ({ ...p, firstName: e.target.value })); }} placeholder="First name *" className={INPUT} />
              <input value={form.headline}  onChange={e => setForm(p => ({ ...p, headline: e.target.value }))}  placeholder="Professional headline" className={INPUT} />
              <input value={form.location}  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}  placeholder="Location" className={INPUT} />
              <input value={form.email}     disabled placeholder={form.email} className={`${INPUT} bg-gray-50 text-gray-400 cursor-not-allowed`} />
            </div>
          </div>

          <textarea
            value={form.bio}
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            placeholder="Write a short bio..."
            rows={3}
            className={`${INPUT} mt-3 resize-none`}
          />

          {formError && <p className="mt-2 text-sm text-red-500">{formError}</p>}

          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className={BTN_PRIMARY}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              Save
            </button>
            <button onClick={() => setEditing(false)} className={BTN_OUTLINE}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ stats, skills }) {
  const statCards = [
    { icon: <BriefcaseIcon />, value: stats.totalApplications, label: 'Total Applications' },
    { icon: <StarIcon />,      value: stats.skillsListed,      label: 'Skills Listed' },
    { icon: <BriefcaseIcon />, value: stats.workExperiences,   label: 'Work Experiences' },
    { icon: <GradIcon />,      value: stats.educationRecords,  label: 'Education Records' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-gray-50 rounded-lg p-4 flex items-center gap-3 border border-gray-100">
            <span className="text-blue-500">{s.icon}</span>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {skills.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Top Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => (
              <span key={s.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${skillColor(s.name)}`}>
                {s.name} <DotRating level={s.level} />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Skills Tab ────────────────────────────────────────────────────────────────
function SkillsTab({ skills, onAdd, onDelete }) {
  const [adding, setAdding]   = useState(false);
  const [name, setName]       = useState('');
  const [level, setLevel]     = useState('Intermediate');
  const [error, setError]     = useState('');

  const handleAdd = async () => {
    if (!name.trim()) { setError('Please fill all required fields'); return; }
    try {
      await onAdd({ name: name.trim(), level });
      setName(''); setLevel('Intermediate'); setAdding(false); setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Skills &amp; Proficiencies</h3>
        {!adding && (
          <button onClick={() => setAdding(true)} className={BTN_PRIMARY}>+ Add Skill</button>
        )}
      </div>

      {adding && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <input
            value={name} onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="Skill name (e.g. React)"
            className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <select value={level} onChange={e => setLevel(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button onClick={handleAdd} className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          </button>
          <button onClick={() => { setAdding(false); setName(''); setError(''); }} className="w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {skills.length === 0 && !adding && (
          <p className="text-sm text-gray-400 py-4">No skills added yet.</p>
        )}
        {skills.map(s => (
          <div key={s.id} className="flex items-center gap-4 py-3 group">
            <span className={`px-2.5 py-1 rounded-lg text-sm font-medium ${skillColor(s.name)}`}>{s.name}</span>
            <DotRating level={s.level} />
            <span className="text-sm text-gray-500">{s.level}</span>
            <button
              onClick={() => onDelete(s.id)}
              className="ml-auto text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Experience Tab ────────────────────────────────────────────────────────────
const EXP_EMPTY = { title: '', company: '', startDate: '', endDate: '', description: '' };

function ExperienceTab({ experiences, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(EXP_EMPTY);
  const [formError, setFormError] = useState('');

  const handleSave = async () => {
    if (!form.title.trim() || !form.company.trim() || !form.startDate) {
      setFormError('Please fill all required fields');
      return;
    }
    setFormError('');
    if (editId) await onUpdate(editId, form);
    else        await onAdd(form);
    setShowForm(false); setEditId(null); setForm(EXP_EMPTY);
  };

  const startEdit = (exp) => {
    setForm({ title: exp.title, company: exp.company, startDate: exp.startDate ?? '', endDate: exp.endDate ?? '', description: exp.description ?? '' });
    setEditId(exp.id); setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Work Experience</h3>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(EXP_EMPTY); }} className={BTN_PRIMARY}>+ Add Experience</button>
        )}
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.title}   onChange={e => { setFormError(''); setForm(p => ({ ...p, title: e.target.value })); }}   placeholder="Job title *" className={INPUT} />
            <input value={form.company} onChange={e => { setFormError(''); setForm(p => ({ ...p, company: e.target.value })); }} placeholder="Company *" className={INPUT} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start date *</label>
              <input type="date" value={form.startDate} onChange={e => { setFormError(''); setForm(p => ({ ...p, startDate: e.target.value })); }} className={INPUT} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End date (leave blank for Present)</label>
              <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className={INPUT} />
            </div>
          </div>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)" rows={2} className={`${INPUT} resize-none`} />
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex gap-2">
            <button onClick={handleSave} className={BTN_PRIMARY}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              Save
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setFormError(''); }} className={BTN_OUTLINE}>Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {experiences.length === 0 && !showForm && <p className="text-sm text-gray-400 py-4">No experience added yet.</p>}
        {experiences.map(exp => (
          <div key={exp.id} className="flex gap-4 p-4 rounded-lg border border-gray-100 group hover:border-gray-200 transition">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 flex-shrink-0">
              <BriefcaseIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{exp.title}</p>
              <p className="text-blue-600 text-sm">{exp.company}</p>
              <p className="text-xs text-gray-400 mt-0.5">{fmtDate(exp.startDate)} — {fmtDate(exp.endDate)}</p>
              {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
              <button onClick={() => startEdit(exp)} className="text-gray-400 hover:text-blue-600"><PencilIcon /></button>
              <button onClick={() => onDelete(exp.id)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Education Tab ─────────────────────────────────────────────────────────────
const EDU_EMPTY = { degree: '', institution: '', startYear: '', endYear: '' };

function EducationTab({ educations, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EDU_EMPTY);
  const [formError, setFormError] = useState('');

  const handleSave = async () => {
    if (!form.degree.trim() || !form.institution.trim() || !form.startYear) {
      setFormError('Please fill all required fields');
      return;
    }
    setFormError('');
    if (editId) await onUpdate(editId, form);
    else        await onAdd(form);
    setShowForm(false); setEditId(null); setForm(EDU_EMPTY);
  };

  const startEdit = (edu) => {
    setForm({ degree: edu.degree, institution: edu.institution, startYear: edu.startYear ?? '', endYear: edu.endYear ?? '' });
    setEditId(edu.id); setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Education</h3>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(EDU_EMPTY); }} className={BTN_PRIMARY}>+ Add Education</button>
        )}
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.degree}      onChange={e => { setFormError(''); setForm(p => ({ ...p, degree: e.target.value })); }}      placeholder="Degree (e.g. B.Sc. Computer Science) *" className={INPUT} />
            <input value={form.institution} onChange={e => { setFormError(''); setForm(p => ({ ...p, institution: e.target.value })); }} placeholder="Institution *" className={INPUT} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={form.startYear} onChange={e => { setFormError(''); setForm(p => ({ ...p, startYear: e.target.value })); }} placeholder="Start year *" className={INPUT} />
            <input type="number" value={form.endYear}   onChange={e => setForm(p => ({ ...p, endYear: e.target.value }))}   placeholder="End year (blank if ongoing)" className={INPUT} />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex gap-2">
            <button onClick={handleSave} className={BTN_PRIMARY}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              Save
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setFormError(''); }} className={BTN_OUTLINE}>Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {educations.length === 0 && !showForm && <p className="text-sm text-gray-400 py-4">No education added yet.</p>}
        {educations.map(edu => (
          <div key={edu.id} className="flex gap-4 p-4 rounded-lg border border-gray-100 group hover:border-gray-200 transition">
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500 flex-shrink-0">
              <GradIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{edu.degree}</p>
              <p className="text-purple-600 text-sm">{edu.institution}</p>
              <p className="text-xs text-gray-400 mt-0.5">{edu.startYear} — {edu.endYear ?? 'Present'}</p>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
              <button onClick={() => startEdit(edu)} className="text-gray-400 hover:text-blue-600"><PencilIcon /></button>
              <button onClick={() => onDelete(edu.id)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tabbed Card ───────────────────────────────────────────────────────────────
const TABS = ['Profile', 'Skills', 'Experience', 'Education'];

function TabbedCard({ data, onSkillAdd, onSkillDelete, onExpAdd, onExpUpdate, onExpDelete, onEduAdd, onEduUpdate, onEduDelete }) {
  const [tab, setTab] = useState('Profile');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 px-6">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-4 px-4 text-sm font-medium border-b-2 transition -mb-px ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === 'Profile' && (
          <ProfileTab stats={data.stats} skills={data.skills} />
        )}
        {tab === 'Skills' && (
          <SkillsTab skills={data.skills} onAdd={onSkillAdd} onDelete={onSkillDelete} />
        )}
        {tab === 'Experience' && (
          <ExperienceTab
            experiences={data.experiences}
            onAdd={onExpAdd} onUpdate={onExpUpdate} onDelete={onExpDelete}
          />
        )}
        {tab === 'Education' && (
          <EducationTab
            educations={data.educations}
            onAdd={onEduAdd} onUpdate={onEduUpdate} onDelete={onEduDelete}
          />
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MyProfile() {
  const [data, setData]     = useState(null);
  const [error, setError]   = useState('');

  const load = async () => {
    try {
      const profile = await candidateService.getProfile();
      setData(profile);
    } catch {
      setError('Failed to load profile.');
    }
  };

  useEffect(() => { load(); }, []);

  const handleSaveProfile = async (form) => {
    await candidateService.updateProfile(form);
    await load();
  };

  const handleAvatarUpload = async (file) => {
    await candidateService.uploadAvatar(file);
    await load();
  };

  const handleSkillAdd = async (payload) => {
    const skill = await candidateService.addSkill(payload);
    setData(p => ({ ...p, skills: [...p.skills, skill], stats: { ...p.stats, skillsListed: p.stats.skillsListed + 1 } }));
  };

  const handleSkillDelete = async (id) => {
    await candidateService.deleteSkill(id);
    setData(p => ({ ...p, skills: p.skills.filter(s => s.id !== id), stats: { ...p.stats, skillsListed: p.stats.skillsListed - 1 } }));
  };

  const handleExpAdd = async (payload) => {
    const exp = await candidateService.addExperience(payload);
    setData(p => ({ ...p, experiences: [exp, ...p.experiences], stats: { ...p.stats, workExperiences: p.stats.workExperiences + 1 } }));
  };

  const handleExpUpdate = async (id, payload) => {
    const exp = await candidateService.updateExperience(id, payload);
    setData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? exp : e) }));
  };

  const handleExpDelete = async (id) => {
    await candidateService.deleteExperience(id);
    setData(p => ({ ...p, experiences: p.experiences.filter(e => e.id !== id), stats: { ...p.stats, workExperiences: p.stats.workExperiences - 1 } }));
  };

  const handleEduAdd = async (payload) => {
    const edu = await candidateService.addEducation(payload);
    setData(p => ({ ...p, educations: [edu, ...p.educations], stats: { ...p.stats, educationRecords: p.stats.educationRecords + 1 } }));
  };

  const handleEduUpdate = async (id, payload) => {
    const edu = await candidateService.updateEducation(id, payload);
    setData(p => ({ ...p, educations: p.educations.map(e => e.id === id ? edu : e) }));
  };

  const handleEduDelete = async (id) => {
    await candidateService.deleteEducation(id);
    setData(p => ({ ...p, educations: p.educations.filter(e => e.id !== id), stats: { ...p.stats, educationRecords: p.stats.educationRecords - 1 } }));
  };

  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error}</div>;
  if (!data)  return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <ProfileHeader profile={data} onSave={handleSaveProfile} onAvatarUpload={handleAvatarUpload} />
        <TabbedCard
          data={data}
          onSkillAdd={handleSkillAdd}      onSkillDelete={handleSkillDelete}
          onExpAdd={handleExpAdd}          onExpUpdate={handleExpUpdate}      onExpDelete={handleExpDelete}
          onEduAdd={handleEduAdd}          onEduUpdate={handleEduUpdate}      onEduDelete={handleEduDelete}
        />
      </div>
    </div>
  );
}
