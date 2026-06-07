import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import StatusBadge from '../../components/recruiter/StatusBadge';
import recruiterService from '../../services/recruiterService';
import api from '../../services/api';

export default function JobSeekers() {
  const navigate = useNavigate();
  const [applicants, setApplicants]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [viewApp, setViewApp]         = useState(null);
  const [pipelineFor, setPipelineFor] = useState(null);
  const [chatLoading, setChatLoading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await recruiterService.getApplicants({ limit: 200 });
      setApplicants(res.data ?? []);
    } catch {
      setError('Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openChat = async (a) => {
    setChatLoading(a.id);
    try {
      const convo = await api.post('/conversations', { recipientId: a.userId }).then(r => r.data);
      navigate('/chat', { state: { conversationId: convo.id } });
    } catch {
      alert('Could not open chat. Please try again.');
    } finally {
      setChatLoading(null);
    }
  };

  return (
    <RecruiterLayout title="Job Seekers">
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : applicants.length === 0 ? (
        <div className="bg-white border border-gray-200 text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No applicants yet</p>
          <p className="text-sm mt-1">Candidates who apply to your standard-employment jobs appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3">Job</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Applied</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map(a => (
                <tr key={a.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">
                      {a.applicant?.firstName || a.applicant?.lastName
                        ? `${a.applicant.firstName ?? ''} ${a.applicant.lastName ?? ''}`.trim()
                        : a.applicant?.email ?? `Applicant #${a.id}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.applicant?.email ?? '—'}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-700">{a.jobTitle ?? '—'}</td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2 justify-end flex-wrap">
                      <button
                        onClick={() => setViewApp(a)}
                        className="px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 whitespace-nowrap transition-colors"
                      >
                        View Application
                      </button>
                      <button
                        onClick={() => setPipelineFor(a)}
                        className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap transition-colors"
                      >
                        Move to Pipeline
                      </button>
                      <button
                        onClick={() => openChat(a)}
                        disabled={chatLoading === a.id}
                        className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap transition-colors disabled:opacity-50"
                      >
                        {chatLoading === a.id ? '…' : 'Live Chat'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewApp     && <ViewApplicationModal app={viewApp}      onClose={() => setViewApp(null)} />}
      {pipelineFor && <PipelineModal        app={pipelineFor}  onClose={() => setPipelineFor(null)} onMoved={load} />}
    </RecruiterLayout>
  );
}

function ViewApplicationModal({ app, onClose }) {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api').replace('/api', '');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onMouseDown={onClose}>
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl"
        onMouseDown={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">Application Details</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {app.applicant?.firstName} {app.applicant?.lastName} · {app.jobTitle}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Email"   value={app.applicant?.email} />
            <InfoField label="Status"  value={<StatusBadge status={app.status} />} />
            <InfoField label="Applied" value={app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : null} />
            {app.expectedSalary != null && (
              <InfoField label="Expected Salary" value={`$${Number(app.expectedSalary).toLocaleString()}`} />
            )}
            {app.availableFrom && <InfoField label="Available From"   value={app.availableFrom} />}
            {app.yearsExperience != null && <InfoField label="Years Experience" value={app.yearsExperience} />}
            {app.phone && <InfoField label="Phone" value={app.phone} />}
            {app.willingToRelocate != null && (
              <InfoField label="Willing to Relocate" value={app.willingToRelocate ? 'Yes' : 'No'} />
            )}
            {app.interviewAt && (
              <InfoField label="Interview Scheduled" value={new Date(app.interviewAt).toLocaleString()} />
            )}
          </div>

          {app.coverLetter && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cover Letter</p>
              <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 border border-gray-200 rounded p-4 leading-relaxed">
                {app.coverLetter}
              </p>
            </div>
          )}

          {app.cvPath && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">CV / Resume</p>
              <a href={`${API_BASE}${app.cvPath}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium">
                Download CV →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="text-sm text-gray-800 mt-0.5">{value ?? '—'}</div>
    </div>
  );
}

function PipelineModal({ app, onClose, onMoved }) {
  const [stages, setStages]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get(`/pipeline/job/${app.jobId}`)
      .then(res => setStages(res.data?.stages ?? []))
      .catch(() => setError('No pipeline is set up for this job yet.'))
      .finally(() => setLoading(false));
  }, [app.jobId]);

  const move = async (stage) => {
    setMoving(true);
    setError('');
    try {
      await api.post('/pipeline/move', {
        applicationId: app.id,
        fromStageId:   app.stageId ?? null,
        toStageId:     stage.id,
      });
      setSuccess(`Moved to "${stage.name}" successfully.`);
      setTimeout(() => { onClose(); onMoved(); }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to move applicant.');
      setMoving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onMouseDown={onClose}>
      <div className="bg-white w-full max-w-sm border border-gray-200 shadow-xl"
        onMouseDown={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Move to Pipeline</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {app.applicant?.firstName} {app.applicant?.lastName} · {app.jobTitle}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-5">
          {loading && <p className="text-sm text-gray-400">Loading pipeline stages…</p>}
          {error   && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600 font-medium">{success}</p>}

          {!loading && !error && stages.length === 0 && (
            <p className="text-sm text-gray-500">No pipeline stages have been defined for this job.</p>
          )}

          {stages.length > 0 && !success && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-3">Select a stage to move this applicant into:</p>
              {stages.map(stage => (
                <button
                  key={stage.id}
                  onClick={() => move(stage)}
                  disabled={moving || stage.id === app.stageId}
                  className="w-full text-left px-4 py-2.5 border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-sm font-medium text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {stage.name}
                  {stage.id === app.stageId && (
                    <span className="ml-2 text-xs text-gray-400 font-normal">(current stage)</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
