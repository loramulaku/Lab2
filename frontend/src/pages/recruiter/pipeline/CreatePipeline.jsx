import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../../components/recruiter/RecruiterLayout';
import pipelineService from '../../../services/pipelineService';

export default function CreatePipeline() {
  const navigate = useNavigate();

  const [existing, setExisting]      = useState(null);
  const [loadingExist, setLoadExist] = useState(true);
  const [stageCount, setStageCount]  = useState('');
  const [stages, setStages]          = useState([]);
  const [saving, setSaving]          = useState(false);
  const [error, setError]            = useState('');
  const [confirmEdit, setConfirmEdit] = useState(false);

  useEffect(() => {
    pipelineService.getMyPipeline()
      .then(p => { setExisting(p); setLoadExist(false); })
      .catch(err => {
        if (err?.response?.status === 404) setExisting(null);
        setLoadExist(false);
      });
  }, []);

  const applyCount = () => {
    const n = Math.max(1, Math.min(20, parseInt(stageCount, 10) || 0));
    setStages(prev =>
      Array.from({ length: n }, (_, i) => prev[i] ?? { name: '', hasCalendar: false })
    );
  };

  const updateName = (i, val) =>
    setStages(prev => prev.map((s, idx) => idx === i ? { ...s, name: val } : s));

  const toggleCalendar = (i) =>
    setStages(prev => prev.map((s, idx) => idx === i ? { ...s, hasCalendar: !s.hasCalendar } : s));

  const validStages = () => stages.filter(s => s.name.trim());

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!validStages().length) { setError('Add at least one stage name.'); return; }
    setSaving(true);
    try {
      await pipelineService.createPipeline(validStages());
      navigate('/recruiter/pipeline/board');
    } catch (err) {
      if (err?.response?.data?.code === 'PIPELINE_EXISTS') {
        navigate('/recruiter/pipeline/board');
        return;
      }
      setError(err?.response?.data?.message || 'Failed to create pipeline.');
    } finally { setSaving(false); }
  };

  const handleEditConfirm = async () => {
    setConfirmEdit(false);
    setError('');
    if (!validStages().length) { setError('Add at least one stage name.'); return; }
    setSaving(true);
    try {
      await pipelineService.editPipeline(validStages());
      navigate('/recruiter/pipeline/board');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update pipeline.');
    } finally { setSaving(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!validStages().length) { setError('Add at least one stage name.'); return; }
    if (existing) {
      setConfirmEdit(true);
    } else {
      handleCreate(e);
    }
  };

  if (loadingExist) return (
    <RecruiterLayout title="Pipeline">
      <p className="text-sm text-gray-400">Loading…</p>
    </RecruiterLayout>
  );

  return (
    <RecruiterLayout title={existing ? 'Edit Pipeline' : 'Create Pipeline'}>
      <div className="max-w-xl">
        {existing && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 mb-6">
            <p className="text-sm font-semibold text-amber-800">You already have a pipeline.</p>
            <p className="text-sm text-amber-700 mt-1">
              Editing will <strong>remove all candidates from the pipeline</strong> and start from scratch.
              Their applications are preserved — only the stage assignments are cleared.
            </p>
            <p className="text-xs text-amber-600 mt-2">
              Current stages: <strong>{existing.stages?.map(s => s.name).join(' → ')}</strong>
            </p>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-6">
          Your pipeline always starts with an <strong>Application</strong> stage (added automatically).
          Enter how many additional stages you want, fill in their names, then click{' '}
          {existing ? 'Update' : 'Create'}.
          Toggle <strong>Has Calendar</strong> on any stage where you want to schedule an interview or meeting date.
        </p>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {/* Step 1 — how many stages */}
        <div className="page-shell-card rounded-xl px-6 py-5 mb-4">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            How many additional stages? (e.g. 4)
          </label>
          <div className="flex gap-3">
            <input
              type="number" min="1" max="20"
              value={stageCount}
              onChange={e => setStageCount(e.target.value)}
              placeholder="e.g. 4"
              className="w-28 border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={applyCount}
              className="px-4 py-2 bg-gray-800 text-white text-sm font-medium hover:bg-gray-700"
            >
              Set Stages
            </button>
          </div>
        </div>

        {/* Step 2 — fill in names + calendar toggle */}
        {stages.length > 0 && (
          <form onSubmit={handleSubmit}>
            <div className="page-shell-card rounded-xl px-6 py-5 mb-4 space-y-4">
              {/* Locked first stage */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Stage 1 (locked)
                </label>
                <input
                  disabled value="Application"
                  className="w-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                />
              </div>

              {stages.map((stage, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Stage {i + 2}
                  </label>
                  <input
                    type="text"
                    value={stage.name}
                    onChange={e => updateName(i, e.target.value)}
                    placeholder={`e.g. ${['Phone Screen', 'Technical Interview', 'HR Interview', 'Offer'][i] ?? `Stage ${i + 2}`}`}
                    className="w-full border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {/* Calendar toggle */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                    <button
                      type="button"
                      onClick={() => toggleCalendar(i)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                        stage.hasCalendar ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                        stage.hasCalendar ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                    <span className="text-sm text-gray-600">
                      {stage.hasCalendar
                        ? <span className="font-medium text-blue-700">Has Calendar — recruiter can schedule a date</span>
                        : <span className="text-gray-400">Has Calendar (off)</span>
                      }
                    </span>
                  </label>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2.5 text-white text-sm font-semibold disabled:opacity-50 ${
                existing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving…' : existing ? 'Update Pipeline' : 'Create Pipeline'}
            </button>
          </form>
        )}
      </div>

      {/* Confirmation modal for destructive edit */}
      {confirmEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/75 px-4">
          <div className="bg-white w-full max-w-md rounded-xl border border-red-200 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 bg-red-50 border-b border-red-100">
              <h3 className="font-bold text-red-800 text-lg">Warning — Destructive Action</h3>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-700">
                Updating the pipeline will <strong>remove all {existing?.stages?.length - 1 ?? 0} candidates</strong> from
                their current stages and reset them to unassigned.
              </p>
              <p className="text-sm text-gray-600">
                Their applications are <strong>not deleted</strong> — only their pipeline stage assignment is cleared.
                You will need to drag them into the new stages again.
              </p>
              <p className="text-sm font-semibold text-red-700">Are you sure you want to proceed?</p>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleEditConfirm}
                className="px-5 py-2 bg-red-600 text-white text-sm font-semibold hover:bg-red-700 rounded"
              >
                Yes, Update Pipeline
              </button>
              <button
                onClick={() => setConfirmEdit(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </RecruiterLayout>
  );
}
