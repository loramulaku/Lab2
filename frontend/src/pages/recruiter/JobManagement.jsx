import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import SiteLayout from '../../components/SiteLayout';
import Pagination from '../../components/Pagination';
import PageHeader from '../../components/PageHeader';
import { PageError } from '../../components/PageFeedback';
import JobFormModal from '../../components/recruiter/JobFormModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';
import jobService from '../../services/jobService';
import { extractJobs } from '../../utils/dashboard';
import { formatLabel } from '../../utils/format';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Active' },
  { id: 'closed', label: 'Closed' },
  { id: 'draft', label: 'Draft' },
];

const PAGE_SIZE = 10;

export default function JobManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast, showToast, dismissToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deleteJob, setDeleteJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await jobService.getMyJobs();
      setJobs(extractJobs(data));
    } catch (err) {
      console.error(err);
      setError('Failed to load jobs.');
      showToast('Failed to load jobs.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingJob(null);
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filtered = useMemo(() => {
    let list = tab === 'all' ? jobs : jobs.filter((j) => j.status === tab);
    list = [...list].sort((a, b) => {
      let av = a[sortKey] ?? '';
      let bv = b[sortKey] ?? '';
      if (sortKey === 'createdAt') {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [jobs, tab, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((j) => j.id)));
  };

  const handleSave = async (formData) => {
    try {
      setSaving(true);
      const description = [
        formData.description,
        formData.requirements && `\n\nRequirements:\n${formData.requirements}`,
        formData.responsibilities && `\n\nResponsibilities:\n${formData.responsibilities}`,
      ].filter(Boolean).join('');

      const payload = { ...formData, description };

      if (editingJob) {
        await jobService.updateJob(editingJob.id, payload);
        showToast('Job updated');
      } else {
        await jobService.createJob(payload);
        showToast('Job published');
      }
      setModalOpen(false);
      setEditingJob(null);
      loadJobs();
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Failed to save job.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteJob) return;
    try {
      await jobService.deleteJob(deleteJob.id);
      showToast('Job deleted');
      setDeleteJob(null);
      loadJobs();
    } catch (err) {
      showToast('Failed to delete job.', 'error');
    }
  };

  const handleDuplicate = async (job) => {
    try {
      const full = await jobService.getJobById(job.id);
      const { id, createdAt, ...rest } = full;
      await jobService.createJob({ ...rest, title: `${rest.title} (Copy)`, status: 'draft' });
      showToast('Job duplicated');
      loadJobs();
    } catch (err) {
      showToast('Failed to duplicate job.', 'error');
    }
  };

  const handleStatusToggle = async (job) => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j)));
    try {
      await jobService.updateJobStatus(job.id, newStatus);
    } catch {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: job.status } : j)));
      showToast('Failed to update status.', 'error');
    }
  };

  const handleBulkStatus = async (status) => {
    const ids = [...selected];
    for (const id of ids) {
      try {
        await jobService.updateJobStatus(id, status);
      } catch { /* continue */ }
    }
    showToast(`Updated ${ids.length} jobs`);
    setSelected(new Set());
    loadJobs();
  };

  return (
    <SiteLayout>
      <Toast toast={toast} onDismiss={dismissToast} />
      <PageHeader
        title="My jobs"
        subtitle="Create, edit, and manage every listing from one place."
        className="mb-6"
        actions={(
          <button
            type="button"
            onClick={() => { setEditingJob(null); setModalOpen(true); }}
            className="btn-primary"
          >
            <PlusIcon className="w-4 h-4" /> Post new job
          </button>
        )}
      />

      {error && <PageError message={error} onRetry={loadJobs} className="mb-5" />}

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setTab(id); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === id
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
          {selected.size > 0 && (
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => handleBulkStatus('open')}
                className="text-xs font-medium px-3 py-1.5 border border-gray-200 rounded-md bg-white hover:bg-gray-50"
              >
                Activate selected
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatus('closed')}
                className="text-xs font-medium px-3 py-1.5 border border-gray-200 rounded-md bg-white hover:bg-gray-50"
              >
                Close selected
              </button>
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-md bg-white overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={paginated.length > 0 && selected.size === paginated.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-gray-800" onClick={() => toggleSort('title')}>
                    Job title {sortKey === 'title' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Applications</th>
                  <th className="px-4 py-3 cursor-pointer hover:text-gray-800" onClick={() => toggleSort('createdAt')}>
                    Posted {sortKey === 'createdAt' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100 animate-pulse">
                      <td colSpan={9} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      No jobs found. Post your first listing to get started.
                    </td>
                  </tr>
                ) : (
                  paginated.map((job, i) => (
                    <tr
                      key={job.id}
                      className={`border-b border-gray-100 group hover:bg-gray-100 transition-colors ${
                        i % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(job.id)}
                          onChange={() => toggleSelect(job.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{job.title}</td>
                      <td className="px-4 py-3 text-gray-600">{job.company?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{formatLabel(job.workMode)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                          {formatLabel(job.employmentType)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(job)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${
                            job.status === 'open' ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          aria-label="Toggle status"
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              job.status === 'open' ? 'left-5' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to="/recruiter/applications"
                          className="text-brand-600 hover:underline font-medium"
                        >
                          {job.applicationCount ?? 0}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-100">
                          <button
                            type="button"
                            onClick={() => { setEditingJob(job); setModalOpen(true); }}
                            className="p-1.5 text-gray-500 hover:text-brand-600 rounded-md hover:bg-brand-50"
                            aria-label="Edit"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(job)}
                            className="p-1.5 text-gray-500 hover:text-gray-800 rounded-md hover:bg-gray-100"
                            aria-label="Duplicate"
                          >
                            <DocumentDuplicateIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteJob(job)}
                            className="p-1.5 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50"
                            aria-label="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

      <JobFormModal
        isOpen={modalOpen}
        job={editingJob}
        onClose={() => { setModalOpen(false); setEditingJob(null); }}
        onSave={handleSave}
        saving={saving}
      />

      {deleteJob && (
        <ConfirmDeleteModal
          message={`Delete "${deleteJob.title}"? This will also delete all applications for this job.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteJob(null)}
        />
      )}
    </SiteLayout>
  );
}
