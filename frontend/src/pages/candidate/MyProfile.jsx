import { useEffect, useState } from 'react';
import candidateService from '../../services/candidateService';
import Header from '../../components/Header';
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';
const avatarSrc = (path) => path ? `${API_BASE}${path}` : null;
const fmtDate   = (d) => d ? d.slice(0, 7) : 'Present';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const TABS   = ['Profile', 'Skills', 'Experience', 'Education'];

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

const BTN_PRIMARY = 'bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 text-sm transition flex items-center gap-2 rounded-none';
const BTN_OUTLINE = 'border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 text-sm transition flex items-center gap-2 rounded-none';

// ── Profile Header ────────────────────────────────────────────────────────────
function ProfileHeader({ profile, onSave, onAvatarUpload }) {
  const [editing, setEditing]     = useState(false);
  const [form, setForm]           = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setForm({
      firstName: profile.firstName ?? '',
      lastName:  profile.lastName  ?? '',
      headline:  profile.headline  ?? '',
      location:  profile.location  ?? '',
      bio:       profile.bio       ?? '',
    });
  }, [profile]);

  const set = (key) => (e) => { setFormError(''); setForm(p => ({ ...p, [key]: e.target.value })); };

  const handleSave = async () => {
    if (!form.firstName.trim()) { setFormError('Please fill all required fields'); return; }
    await onSave(form);
    setEditing(false);
  };

  const fullName    = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
  const memberSince = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-CA') : '';

  return (
    <div className="bg-white border border-gray-200 p-6 mb-4">
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
                  <span className="border border-gray-300 text-gray-600 text-xs font-medium px-3 py-1">Candidate</span>
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition rounded-none">
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
function ProfileTab({ stats, skills }) {
  return (
    <div className="space-y-6">
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
        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-100">
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="Skill name (e.g. React) *"
            className="flex-1 min-w-0 border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-none"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <FormSelect
            value={level}
            onChange={e => setLevel(e.target.value)}
            options={LEVELS}
            className="w-40"
          />
          <button onClick={handleAdd} className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition rounded-none">
            <SaveIcon />
          </button>
          <button onClick={() => { setAdding(false); setName(''); setError(''); }} className="w-9 h-9 border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition rounded-none">
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
        <div className="bg-gray-50 border border-gray-200 p-4 mb-4 space-y-3">
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
            <div key={exp.id} className="flex gap-4 p-4 border border-gray-100 group hover:border-gray-200 transition">
              <div className="w-9 h-9 bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
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
        <div className="bg-gray-50 border border-gray-200 p-4 mb-4 space-y-3">
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
            <div key={edu.id} className="flex gap-4 p-4 border border-gray-100 group hover:border-gray-200 transition">
              <div className="w-9 h-9 bg-purple-50 flex items-center justify-center text-purple-500 flex-shrink-0">
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MyProfile() {
  const [data, setData]   = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab]     = useState('Profile');

  const load = async () => {
    try { setData(await candidateService.getProfile()); }
    catch { setError('Failed to load profile.'); }
  };

  useEffect(() => { load(); }, []);

  const handleSaveProfile   = async (form) => { await candidateService.updateProfile(form); await load(); };
  const handleAvatarUpload  = async (file) => { await candidateService.uploadAvatar(file); await load(); };

  const handleSkillAdd    = async (p)    => { const s = await candidateService.addSkill(p);    setData(d => ({ ...d, skills: [...d.skills, s],      stats: { ...d.stats, skillsListed:     d.stats.skillsListed + 1 } })); };
  const handleSkillDelete = async (id)   => { await candidateService.deleteSkill(id);           setData(d => ({ ...d, skills: d.skills.filter(s => s.skillId !== id), stats: { ...d.stats, skillsListed:     d.stats.skillsListed - 1 } })); };

  const handleExpAdd    = async (p)    => { const e = await candidateService.addExperience(p);       setData(d => ({ ...d, experiences: [e, ...d.experiences], stats: { ...d.stats, workExperiences:  d.stats.workExperiences + 1 } })); };
  const handleExpUpdate = async (id,p) => { const e = await candidateService.updateExperience(id,p); setData(d => ({ ...d, experiences: d.experiences.map(x => x.id === id ? e : x) })); };
  const handleExpDelete = async (id)   => { await candidateService.deleteExperience(id);              setData(d => ({ ...d, experiences: d.experiences.filter(x => x.id !== id), stats: { ...d.stats, workExperiences:  d.stats.workExperiences - 1 } })); };

  const handleEduAdd    = async (p)    => { const e = await candidateService.addEducation(p);       setData(d => ({ ...d, educations: [e, ...d.educations], stats: { ...d.stats, educationRecords: d.stats.educationRecords + 1 } })); };
  const handleEduUpdate = async (id,p) => { const e = await candidateService.updateEducation(id,p); setData(d => ({ ...d, educations: d.educations.map(x => x.id === id ? e : x) })); };
  const handleEduDelete = async (id)   => { await candidateService.deleteEducation(id);              setData(d => ({ ...d, educations: d.educations.filter(x => x.id !== id), stats: { ...d.stats, educationRecords: d.stats.educationRecords - 1 } })); };

  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error}</div>;
  if (!data)  return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto pt-24 pb-8 px-4">
        <ProfileHeader profile={data} onSave={handleSaveProfile} onAvatarUpload={handleAvatarUpload} />

        <div className="bg-white border border-gray-200">
          <TabNav tabs={TABS} active={tab} onChange={setTab} />
          <div className="p-6">
            {tab === 'Profile'    && <ProfileTab stats={data.stats} skills={data.skills} />}
            {tab === 'Skills'     && <SkillsTab skills={data.skills} onAdd={handleSkillAdd} onDelete={handleSkillDelete} />}
            {tab === 'Experience' && <ExperienceTab experiences={data.experiences} onAdd={handleExpAdd} onUpdate={handleExpUpdate} onDelete={handleExpDelete} />}
            {tab === 'Education'  && <EducationTab  educations={data.educations}   onAdd={handleEduAdd} onUpdate={handleEduUpdate} onDelete={handleEduDelete} />}
          </div>
        </div>
      </div>
    </div>
  );
}
