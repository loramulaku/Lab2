import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import candidateService from '../../services/candidateService';
import { PageShell, PageCard } from '../../components/layout';
import FormInput        from '../../components/FormInput';
import FormTextarea     from '../../components/FormTextarea';
import FormSelect       from '../../components/FormSelect';
import SectionHeader    from '../../components/SectionHeader';
import AvatarUpload     from '../../components/AvatarUpload';
import EmptyState       from '../../components/EmptyState';
import StatCard         from '../../components/StatCard';
import SkillBadge       from '../../components/SkillBadge';
import TabNav           from '../../components/TabNav';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import FreelanceToggle  from '../../components/freelance/FreelanceToggle';
import FreelancePanel   from '../../components/freelance/FreelancePanel';

// ── Helpers ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';
const avatarSrc = (path) => path ? `${API_BASE}${path}` : null;
const fmtDate   = (d) => d ? d.slice(0, 7) : 'Present';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const BASE_TABS = ['Profile', 'Skills', 'Experience', 'Education', 'Applications', 'Saved'];

// ── Icons ─────────────────────────────────────────────────────────────────────
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-10-2h4v2h-4V5z"/></svg>;
const StarIcon      = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>;
const GradIcon      = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>;
const PencilIcon    = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>;
const TrashIcon     = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>;
const UploadIcon    = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>;
const LocationIcon  = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const MailIcon      = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const SaveIcon      = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>;
const CancelIcon    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>;

const BTN_PRIMARY = 'bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 text-sm transition flex items-center gap-2 rounded-lg';
const BTN_OUTLINE = 'border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 text-sm transition flex items-center gap-2 rounded-lg';

// ── Profile Header ────────────────────────────────────────────────────────────
function ProfileHeader({ profile, onSave, onAvatarUpload, onCvUpload }) {
  const [editing, setEditing]     = useState(false);
  const [form, setForm]           = useState({});
  const [formError, setFormError] = useState('');
  const [uploadingCv, setUploadingCv] = useState(false);

  useEffect(() => {
    setForm({
      firstName:         profile.firstName ?? '',
      lastName:          profile.lastName  ?? '',
      headline:          profile.headline  ?? '',
      location:          profile.location  ?? '',
      bio:               profile.bio       ?? '',
      phone:             profile.phone        ?? '',
      linkedinUrl:       profile.linkedinUrl  ?? '',
      portfolioUrl:      profile.portfolioUrl ?? '',
      githubUrl:         profile.githubUrl    ?? '',
      yearsExperience:   profile.yearsExperience ?? '',
      willingToRelocate: !!profile.willingToRelocate,
    });
  }, [profile]);

  const handleCv = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !onCvUpload) return;
    setUploadingCv(true);
    try { await onCvUpload(file); } finally { setUploadingCv(false); }
  };
  const cvName = profile.cvPath ? profile.cvPath.split('/').pop() : null;

  const set = (key) => (e) => { setFormError(''); setForm(p => ({ ...p, [key]: e.target.value })); };

  const handleSave = async () => {
    if (!form.firstName.trim()) { setFormError('Please fill all required fields'); return; }
    await onSave(form);
    setEditing(false);
  };

  const fullName    = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
  const memberSince = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-CA') : '';

  return (
    <div className="page-shell-card rounded-xl p-6 mb-4">
      {!editing ? (
        <>
          <div className="flex items-start gap-5">
            <AvatarUpload src={avatarSrc(profile.avatarPath)} onUpload={onAvatarUpload} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{fullName || 'Your Name'}</h1>
                  {profile.headline && <p className="text-blue-600 font-medium mt-0.5">{profile.headline}</p>}
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                    {profile.location && <span className="flex items-center gap-1"><LocationIcon />{profile.location}</span>}
                    {profile.email    && <span className="flex items-center gap-1"><MailIcon />{profile.email}</span>}
                    {memberSince      && <span className="text-gray-400">Member since {memberSince}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="border border-gray-300 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">Candidate</span>
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition rounded-lg">
                    <PencilIcon /> Edit
                  </button>
                </div>
              </div>
              {profile.bio && <p className="mt-3 text-sm text-gray-600 leading-relaxed">{profile.bio}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <label className={`${BTN_PRIMARY} cursor-pointer`}>
              <UploadIcon /> {uploadingCv ? 'Uploading…' : cvName ? 'Replace CV' : 'Upload CV'}
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleCv} className="hidden" disabled={uploadingCv} />
            </label>
            {cvName && (
              <a href={avatarSrc(profile.cvPath)} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                📄 {cvName}
              </a>
            )}
            {(profile.linkedinUrl || profile.portfolioUrl || profile.githubUrl) && (
              <span className="text-xs text-gray-400">· links on file</span>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start gap-5">
            <AvatarUpload src={avatarSrc(profile.avatarPath)} onUpload={onAvatarUpload} />
            <div className="flex-1 grid grid-cols-2 gap-3">
              <FormInput value={form.firstName} onChange={set('firstName')} placeholder="First name *" />
              <FormInput value={form.headline}  onChange={set('headline')}  placeholder="Professional headline" />
              <FormInput value={form.location}  onChange={set('location')}  placeholder="Location" />
              <FormInput value={profile.email}  disabled className="bg-gray-50 text-gray-400 cursor-not-allowed" />
            </div>
          </div>
          <div className="mt-3">
            <FormTextarea value={form.bio} onChange={set('bio')} placeholder="Write a short bio..." rows={3} />
          </div>
          {/* Reusable details that prefill the application & bid forms */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <FormInput value={form.phone}           onChange={set('phone')}           placeholder="Phone" />
            <FormInput type="number"                value={form.yearsExperience} onChange={set('yearsExperience')} placeholder="Years of experience" />
            <FormInput value={form.linkedinUrl}     onChange={set('linkedinUrl')}     placeholder="LinkedIn URL" />
            <FormInput value={form.portfolioUrl}    onChange={set('portfolioUrl')}    placeholder="Portfolio URL" />
            <FormInput value={form.githubUrl}       onChange={set('githubUrl')}       placeholder="GitHub URL" />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={!!form.willingToRelocate}
                onChange={e => setForm(p => ({ ...p, willingToRelocate: e.target.checked }))} className="h-4 w-4" />
              Willing to relocate
            </label>
          </div>
          {formError && <p className="mt-2 text-sm text-red-500">{formError}</p>}
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className={BTN_PRIMARY}><SaveIcon /> Save</button>
            <button onClick={() => { setEditing(false); setFormError(''); }} className={BTN_OUTLINE}><CancelIcon /> Cancel</button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileCompleteness({ profile, stats, skills }) {
  const items = [
    { label: 'Headline',   done: !!profile.headline?.trim() },
    { label: 'Bio',        done: !!profile.bio?.trim() },
    { label: 'CV',         done: !!profile.cvPath },
    { label: 'Skills',     done: (skills?.length ?? 0) > 0 },
    { label: 'Experience', done: (stats?.workExperiences ?? 0) > 0 },
    { label: 'Education',  done: (stats?.educationRecords ?? 0) > 0 },
  ];
  const done = items.filter(i => i.done).length;
  const pct  = Math.round((done / items.length) * 100);
  if (done === items.length) return null;

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">Complete your profile</h3>
        <span className="text-sm font-medium text-blue-600">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-500 mt-3">A complete profile gets noticed by more recruiters. Still to add:</p>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {items.filter(i => !i.done).map(i => (
          <span key={i.label} className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {i.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProfileTab({ profile, stats, skills }) {
  return (
    <div className="space-y-6">
      <ProfileCompleteness profile={profile} stats={stats} skills={skills} />
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={<BriefcaseIcon />} value={stats.totalApplications} label="Total Applications" />
        <StatCard icon={<StarIcon />}      value={stats.skillsListed}      label="Skills Listed" />
        <StatCard icon={<BriefcaseIcon />} value={stats.workExperiences}   label="Work Experiences" />
        <StatCard icon={<GradIcon />}      value={stats.educationRecords}  label="Education Records" />
      </div>
      {skills.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Top Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => <SkillBadge key={s.skillId ?? s.name} name={s.name} level={s.level} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Skills Tab ────────────────────────────────────────────────────────────────
function SkillsTab({ skills, onAdd, onDelete }) {
  const [adding, setAdding]         = useState(false);
  const [name, setName]             = useState('');
  const [level, setLevel]           = useState('Intermediate');
  const [error, setError]           = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleAdd = async () => {
    if (!name.trim()) { setError('Please fill all required fields'); return; }
    try {
      await onAdd({ name: name.trim(), level });
      setName(''); setLevel('Intermediate'); setAdding(false); setError('');
    } catch (e) { setError(e.message); }
  };

  const confirmDelete = async () => {
    await onDelete(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <div>
      <SectionHeader
        title="Skills & Proficiencies"
        onAdd={!adding ? () => setAdding(true) : undefined}
        addLabel="+ Add Skill"
      />

      {adding && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="Skill name (e.g. React) *"
            className="flex-1 min-w-0 border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <FormSelect
            value={level}
            onChange={e => setLevel(e.target.value)}
            options={LEVELS}
            className="w-40"
          />
          <button onClick={handleAdd} className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition rounded-lg">
            <SaveIcon />
          </button>
          <button onClick={() => { setAdding(false); setName(''); setError(''); }} className="w-9 h-9 border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition rounded-lg">
            <CancelIcon />
          </button>
          {error && <span className="text-xs text-red-500 whitespace-nowrap">{error}</span>}
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {skills.length === 0 && !adding
          ? <EmptyState message="No skills added yet." onAdd={() => setAdding(true)} addLabel="+ Add your first skill" />
          : skills.map(s => (
            <div key={s.skillId ?? s.name} className="flex items-center gap-4 py-3 group">
              <SkillBadge name={s.name} level={s.level} />
              <span className="text-sm text-gray-500">{s.level}</span>
              <button onClick={() => setDeleteTarget(s.skillId)} className="ml-auto text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                <TrashIcon />
              </button>
            </div>
          ))
        }
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          message="Remove this skill from your profile?"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ── Experience Tab ────────────────────────────────────────────────────────────
const EXP_EMPTY = { title: '', company: '', startDate: '', endDate: '', description: '' };

function ExperienceTab({ experiences, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm]     = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(EXP_EMPTY);
  const [formError, setFormError]   = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const set = (key) => (e) => { setFormError(''); setForm(p => ({ ...p, [key]: e.target.value })); };

  const openAdd  = () => { setForm(EXP_EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (exp) => {
    setForm({ title: exp.title, company: exp.company, startDate: exp.startDate ?? '', endDate: exp.endDate ?? '', description: exp.description ?? '' });
    setEditId(exp.id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.company.trim() || !form.startDate) {
      setFormError('Please fill all required fields'); return;
    }
    setFormError('');
    if (editId) await onUpdate(editId, form);
    else        await onAdd(form);
    setShowForm(false); setEditId(null); setForm(EXP_EMPTY);
  };

  const confirmDelete = async () => { await onDelete(deleteTarget); setDeleteTarget(null); };

  return (
    <div>
      <SectionHeader title="Work Experience" onAdd={!showForm ? openAdd : undefined} addLabel="+ Add Experience" />

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormInput value={form.title}   onChange={set('title')}   placeholder="Job title *" />
            <FormInput value={form.company} onChange={set('company')} placeholder="Company *" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Start date *" type="date" value={form.startDate} onChange={set('startDate')} />
            <FormInput label="End date (blank = Present)" type="date" value={form.endDate} onChange={set('endDate')} />
          </div>
          <FormTextarea value={form.description} onChange={set('description')} placeholder="Description (optional)" rows={2} />
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex gap-2">
            <button onClick={handleSave} className={BTN_PRIMARY}><SaveIcon /> Save</button>
            <button onClick={() => { setShowForm(false); setEditId(null); setFormError(''); }} className={BTN_OUTLINE}>Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {experiences.length === 0 && !showForm
          ? <EmptyState message="No experience added yet." onAdd={openAdd} addLabel="+ Add Experience" />
          : experiences.map(exp => (
            <div key={exp.id} className="flex gap-4 p-4 border border-gray-100 rounded-lg group hover:border-gray-200 transition">
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
                <button onClick={() => openEdit(exp)} className="text-gray-400 hover:text-blue-600"><PencilIcon /></button>
                <button onClick={() => setDeleteTarget(exp.id)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
              </div>
            </div>
          ))
        }
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          message="Delete this experience entry?"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ── Education Tab ─────────────────────────────────────────────────────────────
const EDU_EMPTY = { degree: '', institution: '', startYear: '', endYear: '' };

function EducationTab({ educations, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm]     = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(EDU_EMPTY);
  const [formError, setFormError]   = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const set = (key) => (e) => { setFormError(''); setForm(p => ({ ...p, [key]: e.target.value })); };

  const openAdd  = () => { setForm(EDU_EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (edu) => {
    setForm({ degree: edu.degree, institution: edu.institution, startYear: edu.startYear ?? '', endYear: edu.endYear ?? '' });
    setEditId(edu.id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.degree.trim() || !form.institution.trim() || !form.startYear) {
      setFormError('Please fill all required fields'); return;
    }
    setFormError('');
    if (editId) await onUpdate(editId, form);
    else        await onAdd(form);
    setShowForm(false); setEditId(null); setForm(EDU_EMPTY);
  };

  const confirmDelete = async () => { await onDelete(deleteTarget); setDeleteTarget(null); };

  return (
    <div>
      <SectionHeader title="Education" onAdd={!showForm ? openAdd : undefined} addLabel="+ Add Education" />

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormInput value={form.degree}      onChange={set('degree')}      placeholder="Degree (e.g. B.Sc. Computer Science) *" />
            <FormInput value={form.institution} onChange={set('institution')} placeholder="Institution *" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput type="number" value={form.startYear} onChange={set('startYear')} placeholder="Start year *" />
            <FormInput type="number" value={form.endYear}   onChange={set('endYear')}   placeholder="End year (blank if ongoing)" />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex gap-2">
            <button onClick={handleSave} className={BTN_PRIMARY}><SaveIcon /> Save</button>
            <button onClick={() => { setShowForm(false); setEditId(null); setFormError(''); }} className={BTN_OUTLINE}>Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {educations.length === 0 && !showForm
          ? <EmptyState message="No education added yet." onAdd={openAdd} addLabel="+ Add Education" />
          : educations.map(edu => (
            <div key={edu.id} className="flex gap-4 p-4 border border-gray-100 rounded-lg group hover:border-gray-200 transition">
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500 flex-shrink-0">
                <GradIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{edu.degree}</p>
                <p className="text-purple-600 text-sm">{edu.institution}</p>
                <p className="text-xs text-gray-400 mt-0.5">{edu.startYear} — {edu.endYear ?? 'Present'}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                <button onClick={() => openEdit(edu)} className="text-gray-400 hover:text-blue-600"><PencilIcon /></button>
                <button onClick={() => setDeleteTarget(edu.id)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
              </div>
            </div>
          ))
        }
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          message="Delete this education entry?"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ── Applications helpers ──────────────────────────────────────────────────────
const fmtApplied = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

// ── Applications Tab ──────────────────────────────────────────────────────────
function NotesModal({ applicationId, jobTitle, onClose }) {
  const [notes, setNotes] = useState(null);
  const [err, setErr]     = useState('');

  useEffect(() => {
    candidateService.getApplicationNotes(applicationId)
      .then(setNotes)
      .catch(() => setErr('Failed to load notes.'));
  }, [applicationId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onMouseDown={onClose}>
      <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-2xl overflow-hidden"
        onMouseDown={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="font-semibold text-gray-900">Recruiter Notes</h3>
            <p className="text-xs text-gray-500 mt-0.5">{jobTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-5 max-h-96 overflow-y-auto">
          {err && <p className="text-sm text-red-500">{err}</p>}
          {!notes && !err && <p className="text-sm text-gray-400">Loading…</p>}
          {notes && notes.length === 0 && <p className="text-sm text-gray-400">No notes yet.</p>}
          {notes && notes.length > 0 && (
            <div className="space-y-3">
              {notes.map(n => (
                <div key={n.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    {n.stageName && (
                      <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                        {n.stageName}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  {n.interviewAt && (
                    <div className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded px-2 py-1">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Interview scheduled: {new Date(n.interviewAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  <p className="text-sm text-gray-700 leading-relaxed">{n.note}</p>
                </div>
              ))}
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

function ApplicationsTab() {
  const [apps, setApps]         = useState(null);
  const [error, setError]       = useState('');
  const [notesFor, setNotesFor] = useState(null);
  const { notifications, markAsRead } = useNotifications();

  // Pipeline stage-change notifications, most recent first (API returns desc order)
  const pipelineNotifs = notifications.filter(n => n.type === 'pipeline_stage_change');
  // First unread pipeline notification (the one that gates the next recruiter move)
  const firstUnread = pipelineNotifs.find(n => !n.isRead) ?? null;

  useEffect(() => {
    candidateService.myApplications({ limit: 100 })
      .then(r => setApps(r.data ?? []))
      .catch(() => setError('Failed to load applications.'));
  }, []);

  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!apps) return <p className="text-sm text-gray-400">Loading…</p>;
  if (apps.length === 0) return <EmptyState message="No applications submitted yet." onAdd={null} addLabel="" />;

  return (
    <>
      {/* Global unread banner */}
      {firstUnread && (
        <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">You have an unread notification</p>
            <p className="text-xs text-amber-700 mt-0.5 line-clamp-2">{firstUnread.message}</p>
          </div>
          <button
            onClick={() => markAsRead(firstUnread.id)}
            className="flex-shrink-0 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded transition-colors"
          >
            Mark as Read
          </button>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {apps.map(app => (
          <div key={app.id} className="py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-sm">{app.jobTitle ?? `Job #${app.jobId}`}</p>
                <p className="text-xs text-gray-500 mt-0.5">{app.companyName ?? '—'}</p>
                {app.stageName && (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full font-medium">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {app.stageName}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="text-xs text-gray-400">{fmtApplied(app.appliedAt)}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2.5">
              <Link
                to={`/job/${app.jobId}`}
                className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded transition-colors"
              >
                View Job
              </Link>
              <button
                onClick={() => setNotesFor({ applicationId: app.id, jobTitle: app.jobTitle ?? `Job #${app.jobId}` })}
                className="text-xs px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded transition-colors"
              >
                Recruiter Notes
              </button>
            </div>
          </div>
        ))}
      </div>

      {notesFor && (
        <NotesModal
          applicationId={notesFor.applicationId}
          jobTitle={notesFor.jobTitle}
          onClose={() => setNotesFor(null)}
        />
      )}
    </>
  );
}

// ── Saved Jobs Tab ────────────────────────────────────────────────────────────
const API_BASE_SAVED = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? '';

function SavedJobsTab() {
  const [saved, setSaved]   = useState(null);
  const [error, setError]   = useState('');

  const load = () => candidateService.getSavedJobs()
    .then(r => setSaved(Array.isArray(r) ? r : []))
    .catch(() => setError('Failed to load saved jobs.'));

  useEffect(() => { load(); }, []);

  const handleUnsave = async (jobId) => {
    await candidateService.unsaveJob(jobId).catch(() => {});
    setSaved(s => s.filter(j => j.id !== jobId));
  };

  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!saved) return <p className="text-sm text-gray-400">Loading…</p>;

  if (saved.length === 0) return (
    <EmptyState message="No saved jobs yet. Bookmark jobs from the job board." onAdd={null} addLabel="" />
  );

  return (
    <div className="divide-y divide-gray-100">
      {saved.map(job => {
        const logoSrc = job.company?.logoPath ? `${API_BASE_SAVED}${job.company.logoPath}` : null;
        return (
          <div key={job.id} className="flex items-center gap-3 py-3">
            {logoSrc
              ? <img src={logoSrc} alt={job.company?.name} loading="lazy" className="w-9 h-9 object-contain border border-gray-100 rounded-lg flex-shrink-0" />
              : <div className="w-9 h-9 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                  {(job.company?.name ?? '?').slice(0, 2).toUpperCase()}
                </div>
            }
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{job.title}</p>
              <p className="text-xs text-gray-500">{job.company?.name ?? '—'} · {job.employmentType?.replace(/-/g, '‑')}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {job.status !== 'open' && <span className="text-xs text-gray-400 italic">Closed</span>}
              <Link to={`/job/${job.id}`} className="text-xs text-blue-600 hover:underline">View</Link>
              <button onClick={() => handleUnsave(job.id)} className="text-gray-300 hover:text-red-500 transition" title="Remove">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MyProfile() {
  const [searchParams]    = useSearchParams();
  const [data, setData]   = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab]     = useState('Profile');

  const load = async () => {
    try { setData(await candidateService.getProfile()); }
    catch { setError('Failed to load profile.'); }
  };

  useEffect(() => { load(); }, []);

  // Deep-link: ?tab=applications or ?tab=freelance
  useEffect(() => {
    if (!data) return;
    const t = searchParams.get('tab')?.toLowerCase();
    if (t === 'applications') setTab('Applications');
    else if (t === 'freelance' && data.freelanceActive) setTab('Freelance');
  }, [data, searchParams]);

  const handleSaveProfile   = async (form) => { await candidateService.updateProfile(form); await load(); };
  const handleAvatarUpload  = async (file) => { await candidateService.uploadAvatar(file); await load(); };
  const handleCvUpload      = async (file) => { await candidateService.uploadCv(file);     await load(); };
  const handleFreelanceToggle = async (next) => {
    await candidateService.setFreelanceMode(next);
    if (!next && tab === 'Freelance') setTab('Profile');
    await load();
  };

  const handleSkillAdd    = async (p)    => { const s = await candidateService.addSkill(p);    setData(d => ({ ...d, skills: [...d.skills, s],      stats: { ...d.stats, skillsListed:     d.stats.skillsListed + 1 } })); };
  const handleSkillDelete = async (id)   => { await candidateService.deleteSkill(id);           setData(d => ({ ...d, skills: d.skills.filter(s => s.skillId !== id), stats: { ...d.stats, skillsListed:     d.stats.skillsListed - 1 } })); };

  const handleExpAdd    = async (p)    => { const e = await candidateService.addExperience(p);       setData(d => ({ ...d, experiences: [e, ...d.experiences], stats: { ...d.stats, workExperiences:  d.stats.workExperiences + 1 } })); };
  const handleExpUpdate = async (id,p) => { const e = await candidateService.updateExperience(id,p); setData(d => ({ ...d, experiences: d.experiences.map(x => x.id === id ? e : x) })); };
  const handleExpDelete = async (id)   => { await candidateService.deleteExperience(id);              setData(d => ({ ...d, experiences: d.experiences.filter(x => x.id !== id), stats: { ...d.stats, workExperiences:  d.stats.workExperiences - 1 } })); };

  const handleEduAdd    = async (p)    => { const e = await candidateService.addEducation(p);       setData(d => ({ ...d, educations: [e, ...d.educations], stats: { ...d.stats, educationRecords: d.stats.educationRecords + 1 } })); };
  const handleEduUpdate = async (id,p) => { const e = await candidateService.updateEducation(id,p); setData(d => ({ ...d, educations: d.educations.map(x => x.id === id ? e : x) })); };
  const handleEduDelete = async (id)   => { await candidateService.deleteEducation(id);              setData(d => ({ ...d, educations: d.educations.filter(x => x.id !== id), stats: { ...d.stats, educationRecords: d.stats.educationRecords - 1 } })); };

  if (error) return <PageShell width="sm"><p className="text-center text-red-500 py-20">{error}</p></PageShell>;
  if (!data)  return <PageShell width="sm" loading />;

  const tabs = data.freelanceActive ? [...BASE_TABS, 'Freelance'] : BASE_TABS;
  // BASE_TABS already includes Applications + Saved

  return (
    <PageShell width="sm" mainClassName="pb-8">
        <ProfileHeader profile={data} onSave={handleSaveProfile} onAvatarUpload={handleAvatarUpload} onCvUpload={handleCvUpload} />

        <FreelanceToggle active={!!data.freelanceActive} onChange={handleFreelanceToggle} />

        <PageCard>
          <TabNav tabs={tabs} active={tab} onChange={setTab} />
          <div className="p-6">
            {tab === 'Profile'      && <ProfileTab profile={data} stats={data.stats} skills={data.skills} />}
            {tab === 'Skills'       && <SkillsTab skills={data.skills} onAdd={handleSkillAdd} onDelete={handleSkillDelete} />}
            {tab === 'Experience'   && <ExperienceTab experiences={data.experiences} onAdd={handleExpAdd} onUpdate={handleExpUpdate} onDelete={handleExpDelete} />}
            {tab === 'Education'    && <EducationTab  educations={data.educations}   onAdd={handleEduAdd} onUpdate={handleEduUpdate} onDelete={handleEduDelete} />}
            {tab === 'Applications' && <ApplicationsTab />}
            {tab === 'Saved'        && <SavedJobsTab />}
            {tab === 'Freelance'    && <FreelancePanel />}
          </div>
        </PageCard>
    </PageShell>
  );
}
