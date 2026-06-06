import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import JobFormModal from '../../components/recruiter/JobFormModal';
import StatusBadge from '../../components/recruiter/StatusBadge';
import recruiterService from '../../services/recruiterService';
import { subscriptionService } from '../../services/subscriptionService';
import freelanceService from '../../services/freelanceService';

export default function MyJobs() {
  const [params, setParams]       = useSearchParams();
  const navigate                  = useNavigate();
  const location                  = useLocation();

  const [companyId, setCompanyId]   = useState(null);
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);      // null = new job, obj = edit
  const [invitees, setInvitees]     = useState([]);        // selected from FreelancerPicker
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice]         = useState('');
  const [hasSub, setHasSub]         = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [profile, sub] = await Promise.all([
        recruiterService.getProfile(),
        subscriptionService.getMySubscription().catch(() => null),
      ]);
      const cid = profile?.company?.id ?? null;
      setCompanyId(cid);
      setHasSub(!!sub);
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
      setInvitees([]);
      setModalOpen(true);
      params.delete('post');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  // Round-trip: returning from FreelancerPicker with selected freelancers
  useEffect(() => {
    if (!location.state?.fromPicker) return;
    const { formData, selectedFreelancers } = location.state;
    setEditing(formData ?? null);
    // null means user clicked "Back to form" without confirming — keep old invitees
    if (selectedFreelancers !== null && selectedFreelancers !== undefined) {
      setInvitees(selectedFreelancers);
    }
    setModalOpen(true);
    // Clear state so a manual refresh doesn't re-open the modal
    navigate(location.pathname, { replace: true, state: {} });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => { setEditing(null); setInvitees([]); setModalOpen(true); };
  const openEdit = (job) => {
    setEditing({
      id: job.id, title: job.title, description: job.description,
      employmentType: job.employmentType, workMode: job.workMode,
      jobMode: job.jobMode ?? 'public',
      experienceLevel: job.experienceLevel ?? '',
      budgetMin: job.budgetMin ?? '', budgetMax: job.budgetMax ?? '',
      responsibilities: job.responsibilities ?? '',
      requirements: job.requirements ?? '',
      niceToHave: job.niceToHave ?? '',
      benefits: job.benefits ?? '',
      schedule: job.schedule ?? undefined,
    });
    setInvitees([]);
    setModalOpen(true);
  };

  // Navigate to FreelancerPicker, carrying current form data for round-trip
  const handleBrowseFreelancers = (formSnapshot) => {
    setModalOpen(false);
    navigate('/recruiter/freelancers/pick', {
      state: {
        formData:  formSnapshot,
        returnTo:  '/recruiter/jobs',
      },
    });
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      let jobId;
      if (editing?.id) {
        await recruiterService.updateJob(editing.id, payload);
        jobId = editing.id;
      } else {
        const created = await recruiterService.createJob(payload);
        jobId = created?.id ?? created?.data?.id;
      }

      // Send invitations for all selected freelancers (invite / both modes)
      const toInvite = payload.invitees ?? [];
      if (jobId && toInvite.length > 0) {
        await Promise.allSettled(
          toInvite.map(f =>
            freelanceService.sendInvitation({
              jobId:            Number(jobId),
              freelancerId:     Number(f._id ?? f.id),
              priceOffer:       payload.budgetMin ?? undefined,
              deliveryTimeDays: undefined,
              message:          '',
            })
          )
        );
      }

      setModalOpen(false);
      setEditing(null);
      setInvitees([]);
      await load();
    } catch (err) {
      const status = err?.response?.status;
      const msg    = err?.response?.data?.message || '';
      if (status === 403 && /subscription|limit/i.test(msg)) {
        setModalOpen(false);
        navigate('/recruiter/billing/upgrade', { state: { reason: msg } });
        return;
      }
      throw err;
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
              const isFreelance    = job.workMode === 'freelance';
              const acceptsBids    = isFreelance && ['public', 'both'].includes(job.jobMode);
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
                        {isFreelance
                          ? `Freelance · ${job.jobMode ?? 'public'}`
                          : `${job.employmentType} · ${job.workMode}`}
                      </p>
                      {(job.budgetMin || job.budgetMax) && (
                        <p className="text-sm text-gray-600 mt-1">
                          Budget: ${Number(job.budgetMin ?? 0).toLocaleString()} – ${Number(job.budgetMax ?? 0).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      {acceptsBids    && <Link to="/recruiter/bids"               className="text-xs text-blue-600 hover:underline">Bids</Link>}
                      {acceptsInvites && <Link to="/recruiter/freelancers/invited" className="text-xs text-blue-600 hover:underline">Invites</Link>}
                      <button onClick={() => openEdit(job)} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50">Edit</button>
                      {job.status === 'open'   && <button onClick={() => setStatus(job, 'closed')} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50">Close</button>}
                      {job.status === 'closed' && <button onClick={() => setStatus(job, 'open')}   className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50">Reopen</button>}
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
        onClose={() => { setModalOpen(false); setEditing(null); setInvitees([]); }}
        onSubmit={handleSubmit}
        initial={editing}
        title={editing?.id ? 'Edit Job' : 'Post a New Job'}
        submitting={submitting}
        hasSubscription={hasSub}
        invitees={invitees}
        onBrowseFreelancers={handleBrowseFreelancers}
      />
    </RecruiterLayout>
  );
}
