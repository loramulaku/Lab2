import { useEffect, useState } from 'react';
import FormInput from '../FormInput';
import FormTextarea from '../FormTextarea';
import FormSelect from '../FormSelect';
import LocationAutocomplete from '../LocationAutocomplete';
import { XMarkIcon } from '@heroicons/react/24/outline';

const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contract', label: 'Contract' },
];

const WORK_MODES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on-site', label: 'On-site' },
];

const EMPTY = {
  title: '',
  description: '',
  requirements: '',
  responsibilities: '',
  employmentType: 'full-time',
  workMode: 'remote',
  budgetMin: '',
  budgetMax: '',
  location: '',
  expiresAt: '',
  status: 'open',
};

export default function JobFormModal({ isOpen, job, onClose, onSave, saving }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!isOpen) return;
    if (job) {
      setForm({
        title: job.title ?? '',
        description: job.description ?? '',
        requirements: job.requirements ?? '',
        responsibilities: job.responsibilities ?? '',
        employmentType: job.employmentType ?? 'full-time',
        workMode: job.workMode ?? 'remote',
        budgetMin: job.budgetMin ?? '',
        budgetMax: job.budgetMax ?? '',
        location: job.location ?? '',
        expiresAt: job.expiresAt?.slice?.(0, 10) ?? job.deadline?.slice?.(0, 10) ?? '',
        status: job.status ?? 'open',
      });
    } else {
      setForm(EMPTY);
    }
  }, [isOpen, job]);

  if (!isOpen) return null;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (status) => {
    onSave({
      ...form,
      status,
      budgetMin: form.budgetMin ? Number(form.budgetMin) : null,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-16">
        <div className="relative w-full max-w-5xl bg-white border border-gray-200 rounded-md shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {job ? 'Edit job' : 'Post new job'}
            </h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            <div className="space-y-4">
              <FormInput label="Job title" value={form.title} onChange={set('title')} required />
              <FormTextarea
                label="Description"
                value={form.description}
                onChange={set('description')}
                rows={4}
              />
              <FormTextarea
                label="Requirements"
                value={form.requirements}
                onChange={set('requirements')}
                rows={3}
                placeholder="One requirement per line"
              />
              <FormTextarea
                label="Responsibilities"
                value={form.responsibilities}
                onChange={set('responsibilities')}
                rows={3}
                placeholder="One responsibility per line"
              />
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Job type"
                  value={form.employmentType}
                  onChange={set('employmentType')}
                  options={JOB_TYPES}
                />
                <FormSelect
                  label="Work mode"
                  value={form.workMode}
                  onChange={set('workMode')}
                  options={WORK_MODES}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Salary min ($)"
                  type="number"
                  value={form.budgetMin}
                  onChange={set('budgetMin')}
                />
                <FormInput
                  label="Salary max ($)"
                  type="number"
                  value={form.budgetMax}
                  onChange={set('budgetMax')}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <LocationAutocomplete
                  value={form.location}
                  onChange={(val) => setForm((f) => ({ ...f, location: val }))}
                />
              </div>
              <FormInput
                label="Expiry date"
                type="date"
                value={form.expiresAt}
                onChange={set('expiresAt')}
              />
              <FormSelect
                label="Status"
                value={form.status}
                onChange={set('status')}
                options={[
                  { value: 'open', label: 'Active' },
                  { value: 'closed', label: 'Closed' },
                  { value: 'draft', label: 'Draft' },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('draft')}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-white disabled:opacity-60"
            >
              Save draft
            </button>
            <button
              type="button"
              disabled={saving || !form.title}
              onClick={() => handleSubmit('open')}
              className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
