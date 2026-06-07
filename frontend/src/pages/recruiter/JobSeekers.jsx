import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import StatusBadge from '../../components/recruiter/StatusBadge';
import recruiterService from '../../services/recruiterService';
import pipelineService from '../../services/pipelineService';

export default function JobSeekers() {
  const navigate = useNavigate();
  const [applicants, setApplicants]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [scheduleFor, setScheduleFor]   = useState(null);
  const [movingId, setMovingId]         = useState(null);

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

  const handleMoveToPipeline = async (a) => {
    setMovingId(a.id);
    try {
      const pipeline = await pipelineService.getMyPipeline().catch(err => {
        if (err?.response?.status === 404) return null;
        throw err;
      });
      if (!pipeline || !pipeline.stages?.length) {
        navigate('/recruiter/pipeline/create');
        return;
      }
      // Navigate to board — recruiter drags the candidate and fills mandatory note there
      navigate('/recruiter/pipeline/board');
    } catch {
      alert('Could not open pipeline. Please try again.');
    } finally {
      setMovingId(null);
    }
  };

  return (
    <RecruiterLayout title="Job Seekers">
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? <p className="text-sm text-gray-400">Loading…</p>
        : applicants.length === 0 ? (
          <div className="bg-white border border-gray-200 text-center py-16 text-gray-400">
            <p className="text-lg">No applicants yet</p>
            <p className="text-sm mt-1">Candidates who apply to your standard-employment jobs appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applicants.map(a => (
              <div key={a.id} className="bg-white border border-gray-200 px-5 py-4 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {a.applicant?.firstName} {a.applicant?.lastName}
                    </h3>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{a.jobTitle} · {a.applicant?.email}</p>
                  {a.interviewAt && (
                    <p className="text-sm text-indigo-600 mt-1">
                      Interview: {new Date(a.interviewAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setScheduleFor(a)}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 whitespace-nowrap">
                    Schedule Interview
                  </button>
                  <button
                    onClick={() => handleMoveToPipeline(a)}
                    disabled={movingId === a.id}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 whitespace-nowrap disabled:opacity-50">
                    {movingId === a.id ? '…' : 'Move to Pipeline'}
                  </button>
                  <button onClick={() => navigate('/chat')}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs hover:bg-gray-50">
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      {scheduleFor && (
        <ScheduleModal
          applicant={scheduleFor}
          onClose={() => setScheduleFor(null)}
          onScheduled={async () => { setScheduleFor(null); await load(); }}
        />
      )}
    </RecruiterLayout>
  );
}

function ScheduleModal({ applicant, onClose, onScheduled }) {
  const [when, setWhen] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!when) { setError('Pick a date and time.'); return; }
    setSaving(true);
    setError('');
    try {
      await recruiterService.scheduleInterview(applicant.id, new Date(when).toISOString());
      onScheduled();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to schedule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onMouseDown={onClose}>
      <div className="bg-white w-full max-w-sm border border-gray-200 shadow-xl" onMouseDown={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Schedule Interview</h3>
          <p className="text-sm text-gray-500">{applicant.applicant?.firstName} {applicant.applicant?.lastName} · {applicant.jobTitle}</p>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interview date &amp; time</label>
            <input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Schedule'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
