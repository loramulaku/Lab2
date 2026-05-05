import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../../services/jobs';

const EXPERIENCE_LEVELS = ['junior', 'mid', 'senior'];
const WORK_MODES        = ['remote', 'on-site', 'hybrid'];

export default function CreateJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', employmentType: 'full-time',
    jobMode: 'public', experienceLevel: '', workMode: '',
    budgetMin: '', budgetMax: '', deadline: '',
  });
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.employmentType === 'full-time') delete payload.jobMode;
      if (!payload.budgetMin)      delete payload.budgetMin;
      if (!payload.budgetMax)      delete payload.budgetMax;
      if (!payload.experienceLevel) delete payload.experienceLevel;
      if (!payload.workMode)       delete payload.workMode;
      if (!payload.deadline)       delete payload.deadline;
      const job = await createJob(payload);
      navigate(`/jobs/${job.id}`);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create job');
    } finally {
      setLoading(false);
    }
  }

  const isFreelance = form.employmentType === 'freelance';

  return (
    <div style={s.page}>
      <h1 style={s.pageTitle}>Post a Job</h1>
      <p style={s.pageSub}>Fill in the details below to publish your job listing.</p>

      <div className="card" style={s.card}>
        <form onSubmit={handleSubmit} style={s.form}>

          <div style={s.field}>
            <label style={s.label}>Job Title *</label>
            <input style={s.input} value={form.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. Senior React Developer" />
          </div>

          <div style={s.field}>
            <label style={s.label}>Description</label>
            <textarea style={s.textarea} value={form.description} onChange={e => set('description', e.target.value)} rows={5} placeholder="Describe the role, responsibilities, and requirements..." />
          </div>

          <div style={s.field}>
            <label style={s.label}>Job Type *</label>
            <div style={s.typeRow}>
              {[{ val: 'full-time', label: 'Full-time', sub: 'Permanent employee position' }, { val: 'freelance', label: 'Freelance', sub: 'Project-based contract work' }].map(opt => (
                <label key={opt.val} style={{ ...s.typeCard, ...(form.employmentType === opt.val ? s.typeCardActive : {}) }}>
                  <input type="radio" name="employmentType" value={opt.val} checked={form.employmentType === opt.val} onChange={() => set('employmentType', opt.val)} style={{ display: 'none' }} />
                  <span style={s.typeName}>{opt.label}</span>
                  <span style={s.typeSub}>{opt.sub}</span>
                </label>
              ))}
            </div>
          </div>

          {isFreelance && (
            <div style={s.field}>
              <label style={s.label}>Posting Mode *</label>
              <div style={s.modeGroup}>
                {[
                  { val: 'public', title: 'Public (Option A)', desc: 'Post publicly — freelancers submit bids' },
                  { val: 'invite', title: 'Invite-only (Option B)', desc: 'Search & invite specific freelancers' },
                  { val: 'both',   title: 'Both (Option C)',   desc: 'Public bids + you can also invite directly' },
                ].map(opt => (
                  <label key={opt.val} style={{ ...s.modeCard, ...(form.jobMode === opt.val ? s.modeCardActive : {}) }}>
                    <input type="radio" name="jobMode" value={opt.val} checked={form.jobMode === opt.val} onChange={() => set('jobMode', opt.val)} style={{ display: 'none' }} />
                    <span style={s.modeTitle}>{opt.title}</span>
                    <span style={s.modeDesc}>{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={s.row}>
            <div style={s.col}>
              <label style={s.label}>Experience Level</label>
              <select style={s.select} value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
                <option value="">Any</option>
                {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={s.col}>
              <label style={s.label}>Work Mode</label>
              <select style={s.select} value={form.workMode} onChange={e => set('workMode', e.target.value)}>
                <option value="">Any</option>
                {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div style={s.row}>
            <div style={s.col}>
              <label style={s.label}>{isFreelance ? 'Budget Min ($)' : 'Salary Min ($)'}</label>
              <input type="number" style={s.input} value={form.budgetMin} onChange={e => set('budgetMin', e.target.value)} min={0} placeholder="0" />
            </div>
            <div style={s.col}>
              <label style={s.label}>{isFreelance ? 'Budget Max ($)' : 'Salary Max ($)'}</label>
              <input type="number" style={s.input} value={form.budgetMax} onChange={e => set('budgetMax', e.target.value)} min={0} placeholder="0" />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Deadline</label>
            <input type="date" style={s.input} value={form.deadline} onChange={e => set('deadline', e.target.value)} />
          </div>

          {error && <p style={s.error}>{error}</p>}

          <div style={s.footer}>
            <button type="submit" className="btn-primary" style={{ fontSize: '0.95rem', padding: '0.65rem 2rem' }} disabled={loading}>
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s = {
  page:          { maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' },
  pageTitle:     { fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' },
  pageSub:       { color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.75rem' },
  card:          { padding: '2rem' },
  form:          { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  field:         { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label:         { fontWeight: 600, fontSize: '0.875rem', color: '#374151' },
  input:         { padding: '0.6rem 0.875rem', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '0.9rem', color: '#111827', outline: 'none', transition: 'border-color 0.15s' },
  textarea:      { padding: '0.6rem 0.875rem', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '0.9rem', resize: 'vertical', color: '#111827', outline: 'none' },
  select:        { padding: '0.6rem 0.875rem', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '0.9rem', color: '#111827', background: '#fff', outline: 'none' },
  typeRow:       { display: 'flex', gap: '0.875rem' },
  typeCard:      { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.875rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' },
  typeCardActive:{ borderColor: '#2563EB', background: '#EFF6FF' },
  typeName:      { fontWeight: 600, fontSize: '0.9rem', color: '#111827' },
  typeSub:       { fontSize: '0.78rem', color: '#6B7280' },
  modeGroup:     { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  modeCard:      { display: 'flex', flexDirection: 'column', gap: '0.15rem', padding: '0.875rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' },
  modeCardActive:{ borderColor: '#2563EB', background: '#EFF6FF' },
  modeTitle:     { fontWeight: 600, fontSize: '0.875rem', color: '#111827' },
  modeDesc:      { fontSize: '0.8rem', color: '#6B7280' },
  row:           { display: 'flex', gap: '1rem' },
  col:           { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  error:         { color: '#DC2626', fontSize: '0.875rem', padding: '0.5rem 0.75rem', background: '#FEF2F2', borderRadius: 8 },
  footer:        { paddingTop: '0.5rem' },
};
