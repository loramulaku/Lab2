import { useEffect, useState } from 'react';

/**
 * Reusable Post-a-Job / Edit-Job modal.
 *
 * Data model (matches the existing DB exactly):
 *   employment_type : 'full-time' | 'part-time' | 'freelance'   ← drives homepage filters + freelance flow
 *   work_mode       : 'remote' | 'on-site' | 'hybrid'
 *   job_mode        : 'public' | 'invite' | 'both'  (ONLY when employment_type = 'freelance')
 *
 * When Employment Type = Freelance the recruiter must pick a hiring mode:
 *   A) Post Job (public)   → public board, freelancers submit bids
 *   B) Search & Invite     → recruiter invites freelancers directly
 *   C) Both                → public bids AND direct invitations in parallel
 *
 * Props:
 *   open, onClose, onSubmit({...payload}) => Promise, initial (for edit), title, submitting
 */
const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-time (Standard)' },
  { value: 'part-time', label: 'Part-time (Standard)' },
  { value: 'freelance', label: 'Freelance' },
];
const WORK_MODES = ['remote', 'on-site', 'hybrid'];
const JOB_MODES = [
  { value: 'public', label: 'Post Job (public board)', desc: 'Freelancers browse and submit bids.' },
  { value: 'invite', label: 'Search & Invite',        desc: 'You search freelancers and send direct invitations.' },
  { value: 'both',   label: 'Both',                    desc: 'Public bids and direct invitations run in parallel.' },
];

const EMPTY = { title: '', description: '', employmentType: 'full-time', workMode: 'remote', jobMode: 'public', budgetMin: '', budgetMax: '' };

export default function JobFormModal({ open, onClose, onSubmit, initial, title = 'Post a New Job', submitting = false }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY, ...initial } : EMPTY);
      setError('');
    }
  }, [open, initial]);

  if (!open) return null;

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const isFreelance = form.employmentType === 'freelance';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    setError('');
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      employmentType: form.employmentType,
      workMode: form.workMode,
      jobMode: isFreelance ? form.jobMode : null,
      budgetMin: form.budgetMin ? Number(form.budgetMin) : null,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : null,
    };
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save job.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto" onMouseDown={onClose}>
      <div className="bg-white w-full max-w-lg border border-gray-200 shadow-xl my-auto" onMouseDown={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input value={form.title} onChange={set('title')}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Senior Frontend Developer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={4} value={form.description} onChange={set('description')}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the role, responsibilities, and requirements…" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select value={form.employmentType} onChange={set('employmentType')}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {EMPLOYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
              <select value={form.workMode} onChange={set('workMode')}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {isFreelance && (
            <div className="bg-indigo-50/60 border border-indigo-100 p-3">
              <label className="block text-sm font-medium text-gray-800 mb-2">Freelance Hiring Mode</label>
              <div className="space-y-2">
                {JOB_MODES.map(m => (
                  <label key={m.value} className="flex items-start gap-2.5 cursor-pointer">
                    <input type="radio" name="jobMode" value={m.value}
                      checked={form.jobMode === m.value} onChange={set('jobMode')} className="mt-0.5" />
                    <span>
                      <span className="text-sm font-medium text-gray-800">{m.label}</span>
                      <span className="block text-xs text-gray-500">{m.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Min ($)</label>
              <input type="number" min="0" value={form.budgetMin} onChange={set('budgetMin')}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 3000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Max ($)</label>
              <input type="number" min="0" value={form.budgetMax} onChange={set('budgetMax')}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 5000" />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
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
