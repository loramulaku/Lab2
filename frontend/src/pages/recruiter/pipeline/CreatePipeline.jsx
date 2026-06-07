import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../../components/recruiter/RecruiterLayout';
import pipelineService from '../../../services/pipelineService';

export default function CreatePipeline() {
  const navigate = useNavigate();
  const [stageCount, setStageCount]   = useState('');
  const [stageNames, setStageNames]   = useState([]);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  const applyCount = () => {
    const n = Math.max(1, Math.min(20, parseInt(stageCount, 10) || 0));
    setStageNames(Array.from({ length: n }, (_, i) => stageNames[i] ?? ''));
  };

  const updateName = (i, val) => {
    setStageNames(prev => { const next = [...prev]; next[i] = val; return next; });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const valid = stageNames.filter(s => s.trim());
    if (!valid.length) { setError('Add at least one stage name.'); return; }
    setSaving(true);
    try {
      await pipelineService.createPipeline(valid);
      navigate('/recruiter/pipeline/board');
    } catch (err) {
      if (err?.response?.data?.code === 'PIPELINE_EXISTS') {
        navigate('/recruiter/pipeline/board');
        return;
      }
      setError(err?.response?.data?.message || 'Failed to create pipeline.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RecruiterLayout title="Create Pipeline">
      <div className="max-w-xl">
        <p className="text-sm text-gray-500 mb-6">
          Your pipeline always starts with an <strong>Application</strong> stage (added automatically).
          Enter how many additional stages you want, fill in their names, then click Create.
        </p>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {/* Step 1 — how many stages */}
        <div className="bg-white border border-gray-200 px-6 py-5 mb-4">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            How many additional stages? (e.g. 4)
          </label>
          <div className="flex gap-3">
            <input
              type="number" min="1" max="20"
              value={stageCount}
              onChange={e => setStageCount(e.target.value)}
              placeholder="e.g. 4"
              className="w-28 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Step 2 — fill in names */}
        {stageNames.length > 0 && (
          <form onSubmit={submit}>
            <div className="bg-white border border-gray-200 px-6 py-5 mb-4 space-y-3">
              {/* Locked first stage */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Stage 1 (locked)
                </label>
                <input
                  disabled value="Application"
                  className="w-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                />
              </div>

              {stageNames.map((name, i) => (
                <div key={i}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Stage {i + 2}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => updateName(i, e.target.value)}
                    placeholder={`e.g. ${['Phone Screen', 'Technical Interview', 'HR Interview', 'Offer'][i] ?? `Stage ${i + 2}`}`}
                    className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Creating…' : 'Create Pipeline'}
            </button>
          </form>
        )}
      </div>
    </RecruiterLayout>
  );
}
