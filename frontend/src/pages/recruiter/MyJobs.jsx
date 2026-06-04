import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import JobFormModal from '../../components/recruiter/JobFormModal';
import StatusBadge from '../../components/recruiter/StatusBadge';
import recruiterService from '../../services/recruiterService';

export default function MyJobs() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await recruiterService.getProfile();
      const cid = profile?.company?.id ?? null;
      setCompanyId(cid);
      const res = await recruiterService.listJobs({ companyId: cid, limit: 100 });
      setJobs((res.data ?? []).filter(j => j.status !== 'archived'));
    } catch {
      setNotice('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // "Post a Job" sidebar link sets ?post=1
  useEffect(() => {
    if (params.get('post') === '1') {
      setEditing(null);
      setModalOpen(true);
      params.delete('post');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (job) => {
    setEditing({
      id: job.id, title: job.title, description: job.description,
      employmentType: job.employmentType, workMode: job.workMode,
      jobMode: job.jobMode ?? 'public',
      budgetMin: job.budgetMin ?? '', budgetMax: job.budgetMax ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editing?.id) await recruiterService.updateJob(editing.id, payload);
      else             await recruiterService.createJob(payload);
      setModalOpen(false);
      await load();
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || '';
      // No active subscription / over the job limit → send to billing.
      if (status === 403 && /subscription|limit/i.test(msg)) {
        setModalOpen(false);
        navigate('/recruiter/billing/upgrade', { state: { reason: msg } });
        return;
      }
      throw err; // surfaced inside the modal
    } finally {
      setSubmitting(false);
    }
  };

  const setStatus = async (job, status) => {
    await recruiterService.setJobStatus(job.id, status);
    await load();
  };

  return (
    <RecruiterLayout title="My Job Listings">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{jobs.length} active listing{jobs.length === 1 ? '' : 's'}</p>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
          + Post a Job
        </button>
      </div>

      {notice && <p className="text-sm text-red-600 mb-4">{notice}</p>}

      {loading ? <p className="text-sm text-gray-400">Loading…</p>
        : jobs.length === 0 ? (
          <div className="bg-white border border-gray-200 text-center py-16 text-gray-400">
            <p className="text-lg">No active job listings</p>
            <p className="text-sm mt-1">Click "Post a Job" to create your first listing.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => {
              const isFreelance = job.employmentType === 'freelance';
              const acceptsBids = isFreelance && ['public', 'both'].includes(job.jobMode);
              const acceptsInvites = isFreelance && ['invite', 'both'].includes(job.jobMode);
              return (
                <div key={job.id} className="bg-white border border-gray-200 px-5 py-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <StatusBadge status={job.status} />
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {job.employmentType} · {job.workMode}{isFreelance && job.jobMode ? ` · ${job.jobMode}` : ''}
                      </p>
                      {(job.budgetMin || job.budgetMax) && (
                        <p className="text-sm text-gray-600 mt-1">
                          Budget: ${Number(job.budgetMin ?? 0).toLocaleString()} – ${Number(job.budgetMax ?? 0).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      {acceptsBids && <Link to="/recruiter/bids" className="text-xs text-blue-600 hover:underline">Bids</Link>}
                      {acceptsInvites && <Link to="/recruiter/freelancers/invited" className="text-xs text-blue-600 hover:underline">Invites</Link>}
                      <button onClick={() => openEdit(job)} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50">Edit</button>
                      {job.status === 'open' && (
                        <button onClick={() => setStatus(job, 'closed')} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50">Close</button>
                      )}
                      {job.status === 'closed' && (
                        <button onClick={() => setStatus(job, 'open')} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50">Reopen</button>
                      )}
                      <button onClick={() => setStatus(job, 'archived')} className="px-3 py-1.5 border border-gray-300 text-gray-500 text-xs hover:bg-gray-50">Archive</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      <JobFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        title={editing?.id ? 'Edit Job' : 'Post a New Job'}
        submitting={submitting}
      />
    </RecruiterLayout>
  );
}
