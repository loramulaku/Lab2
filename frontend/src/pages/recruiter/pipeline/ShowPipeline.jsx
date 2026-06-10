import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../../components/recruiter/RecruiterLayout';
import ContractModal from '../../../components/recruiter/ContractModal';
import pipelineService from '../../../services/pipelineService';

const COLUMN_COLORS = [
  'border-t-blue-400',
  'border-t-purple-400',
  'border-t-amber-400',
  'border-t-green-400',
  'border-t-rose-400',
  'border-t-cyan-400',
  'border-t-orange-400',
  'border-t-indigo-400',
];

function initials(first, last) {
  return `${(first ?? '')[0] ?? ''}${(last ?? '')[0] ?? ''}`.toUpperCase() || '?';
}

function avatarColor(name) {
  const colors = ['bg-blue-500','bg-purple-500','bg-green-500','bg-rose-500','bg-amber-500','bg-indigo-500','bg-teal-500'];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[h % colors.length];
}

// ── Create / Edit Pipeline UI ─────────────────────────────────────────────────

function PipelineSetupPanel({ existing, onSaved }) {
  const [stageCount, setStageCount]   = useState('');
  const [stages, setStages]           = useState([]);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');
  const [confirmEdit, setConfirmEdit] = useState(false);

  const applyCount = () => {
    const n = Math.max(1, Math.min(20, parseInt(stageCount, 10) || 0));
    setStages(prev =>
      Array.from({ length: n }, (_, i) => prev[i] ?? { name: '', hasCalendar: false })
    );
  };

  const updateName     = (i, val) => setStages(prev => prev.map((s, idx) => idx === i ? { ...s, name: val } : s));
  const toggleCalendar = (i)      => setStages(prev => prev.map((s, idx) => idx === i ? { ...s, hasCalendar: !s.hasCalendar } : s));
  const validStages    = ()       => stages.filter(s => s.name.trim());

  const doSave = async () => {
    setError('');
    if (!validStages().length) { setError('Add at least one stage name.'); return; }
    setSaving(true);
    try {
      if (existing) {
        await pipelineService.editPipeline(validStages());
      } else {
        await pipelineService.createPipeline(validStages());
      }
      // Reset local state before calling onSaved which may unmount this component
      setSaving(false);
      setConfirmEdit(false);
      onSaved();
    } catch (err) {
      setSaving(false);
      setConfirmEdit(false);
      if (err?.response?.data?.code === 'PIPELINE_EXISTS') { onSaved(); return; }
      setError(err?.response?.data?.message || 'Failed to save pipeline.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!validStages().length) { setError('Add at least one stage name.'); return; }
    if (existing) setConfirmEdit(true);
    else doSave();
  };

  return (
    <div className="max-w-xl">
      {existing && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 mb-6">
          <p className="text-sm font-semibold text-amber-800">You already have a pipeline — editing will reset all stage assignments.</p>
          <p className="text-xs text-amber-600 mt-1">
            Current stages: <strong>{existing.stages?.map(s => s.name).join(' → ')}</strong>
          </p>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-6">
        Your pipeline always starts with an <strong>Application</strong> stage (added automatically).
        Enter how many additional stages you want, fill in their names, then click{' '}
        {existing ? 'Update' : 'Create'}.
        Toggle <strong>Has Calendar</strong> on any stage where you want to schedule an interview date.
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

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
          <button type="button" onClick={applyCount}
            className="px-4 py-2 bg-gray-800 text-white text-sm font-medium hover:bg-gray-700">
            Set Stages
          </button>
        </div>
      </div>

      {stages.length > 0 && (
        <form onSubmit={handleSubmit}>
          <div className="page-shell-card rounded-xl px-6 py-5 mb-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Stage 1 (locked)</label>
              <input disabled value="Application"
                className="w-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 cursor-not-allowed" />
            </div>
            {stages.map((stage, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Stage {i + 2}</label>
                <input
                  type="text" value={stage.name}
                  onChange={e => updateName(i, e.target.value)}
                  placeholder={`e.g. ${['Phone Screen', 'Technical Interview', 'HR Interview', 'Offer'][i] ?? `Stage ${i + 2}`}`}
                  className="w-full border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                  <button
                    type="button" onClick={() => toggleCalendar(i)}
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

          <button type="submit" disabled={saving}
            className={`px-6 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${
              existing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saving ? 'Saving…' : existing ? 'Update Pipeline' : 'Create Pipeline'}
          </button>
        </form>
      )}

      {confirmEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/75 px-4">
          <div className="bg-white w-full max-w-md rounded-xl border border-red-200 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 bg-red-50 border-b border-red-100">
              <h3 className="font-bold text-red-800 text-lg">Warning — Destructive Action</h3>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-700">
                Updating the pipeline will <strong>remove all candidates</strong> from their current stages.
              </p>
              <p className="text-sm text-gray-600">
                Applications are <strong>not deleted</strong> — only stage assignments are cleared.
              </p>
              <p className="text-sm font-semibold text-red-700">Are you sure you want to proceed?</p>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={doSave}
                className="px-5 py-2 bg-red-600 text-white text-sm font-semibold hover:bg-red-700 rounded-lg transition-colors">
                Yes, Update Pipeline
              </button>
              <button onClick={() => setConfirmEdit(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Kanban Board ─────────────────────────────────────────────────────────

export default function ShowPipeline() {
  const navigate = useNavigate();
  const [board, setBoard]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [noPipeline, setNoPipeline]     = useState(false);
  const [search, setSearch]             = useState('');
  const [searchInput, setInput]         = useState('');
  const [error, setError]               = useState('');
  const [transModal, setTransModal]     = useState(null);
  const [addNoteModal, setAddNoteModal] = useState(null);
  const [dragCard, setDragCard]         = useState(null);
  const [overStage, setOverStage]       = useState(null);
  const [showSetup, setShowSetup]       = useState(false);
  const [contractTarget, setContractTarget] = useState(null); // candidate being offered a contract
  const debounceRef                     = useRef(null);

  const load = useCallback(async (q = search) => {
    setLoading(true);
    setError('');
    try {
      const data = await pipelineService.getBoard(q);
      setBoard(data);
      setNoPipeline(false);
    } catch (err) {
      if (err?.response?.data?.code === 'NO_PIPELINE') {
        setNoPipeline(true);
        setBoard(null);
      } else {
        setError('Failed to load pipeline board.');
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val) => {
    setInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(val), 350);
  };

  // ── Drag-and-drop ─────────────────────────────────────────────────────────
  const onDragStart = (applicationId, fromStageId, firstName, lastName, lastNotificationRead) =>
    setDragCard({ applicationId, fromStageId, firstName, lastName, lastNotificationRead });

  const onDragOver = (e, stageId) => { e.preventDefault(); setOverStage(stageId); };

  const onDrop = (e, toStage) => {
    e.preventDefault();
    setOverStage(null);
    if (!dragCard || dragCard.fromStageId === toStage.id) { setDragCard(null); return; }
    if (dragCard.lastNotificationRead === false) { setDragCard(null); return; }
    const moved = { ...dragCard };
    setDragCard(null);
    setTransModal({
      applicationId: moved.applicationId,
      fromStageId:   moved.fromStageId,
      toStageId:     toStage.id,
      toStageName:   toStage.name,
      hasCalendar:   !!toStage.hasCalendar,
      candidateName: `${moved.firstName ?? ''} ${moved.lastName ?? ''}`.trim() || `Candidate #${moved.applicationId}`,
    });
  };

  const onDragEnd = () => { setOverStage(null); setDragCard(null); };

  const rejectCandidate = async (applicationId) => {
    try {
      await pipelineService.rejectApplication(applicationId);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reject candidate.');
    }
  };

  const handleTransitionConfirmed = async ({ applicationId, toStageId, note, interviewDate }) => {
    setTransModal(null);
    setBoard(prev => {
      if (!prev) return prev;
      let card = null;
      const stages = prev.stages.map(s => ({
        ...s,
        candidates: s.candidates.filter(c => {
          if (c.applicationId === applicationId) { card = { ...c, stageId: toStageId, lastNotificationRead: false }; return false; }
          return true;
        }),
      }));
      return { ...prev, stages: stages.map(s => s.id === toStageId && card ? { ...s, candidates: [...s.candidates, card] } : s) };
    });
    try {
      await pipelineService.moveCandidate(applicationId, toStageId, note, interviewDate);
    } catch { load(); }
  };

  // ── No pipeline yet ───────────────────────────────────────────────────────
  if (!loading && noPipeline) {
    return (
      <RecruiterLayout title="Hiring Pipeline">
        <div className="mb-6">
          <p className="text-sm text-gray-500">No pipeline set up yet. Create one to start managing candidates.</p>
        </div>
        <PipelineSetupPanel existing={null} onSaved={() => { setNoPipeline(false); load(); }} />
      </RecruiterLayout>
    );
  }

  if (loading && !board) return (
    <RecruiterLayout title="Hiring Pipeline">
      <div className="w-full overflow-x-auto pb-2">
        <div className="flex gap-4">
          {[1,2,3,4].map(i => <div key={i} className="flex-shrink-0 w-64 bg-gray-100 rounded-lg h-96 animate-pulse" />)}
        </div>
      </div>
    </RecruiterLayout>
  );

  return (
    <RecruiterLayout title="Hiring Pipeline">
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* Toolbar */}
      <div className="mb-5 flex items-center gap-3 flex-wrap">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
          </svg>
          <input type="text" value={searchInput} onChange={e => handleSearch(e.target.value)}
            placeholder="Search candidates…"
            className="pl-9 pr-3 py-2 border border-gray-300 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
        </div>
        {searchInput && (
          <button onClick={() => { setInput(''); setSearch(''); }} className="text-xs text-gray-500 hover:text-gray-700 underline">
            Clear
          </button>
        )}

        <button
          onClick={() => setShowSetup(v => !v)}
          className="ml-auto px-4 py-2 border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 font-medium rounded-lg transition-colors"
        >
          {showSetup ? 'Hide Setup' : 'Edit Pipeline'}
        </button>

        <div className="text-xs text-gray-400 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
            Read — can move
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
            Unread — blocked
          </span>
        </div>
      </div>

      {/* Inline setup panel */}
      {showSetup && board && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Pipeline Setup</h2>
          <PipelineSetupPanel
            existing={board}
            onSaved={() => { setShowSetup(false); load(); }}
          />
        </div>
      )}

      {/* Board */}
      {board && (
        <div className="w-full overflow-x-auto board-scrollbar pb-3">
          <div className="flex gap-4 min-h-[70vh] items-start">
            {board.stages.map((stage, si) => {
            const isLastStage = si === board.stages.length - 1;
            return (
            <div
              key={stage.id}
              onDragOver={e => onDragOver(e, stage.id)}
              onDrop={e => onDrop(e, stage)}
              className={`flex-shrink-0 w-64 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col transition-all duration-150 ${
                overStage === stage.id ? 'ring-2 ring-blue-400 bg-blue-50/30' : ''
              } border-t-4 ${COLUMN_COLORS[si % COLUMN_COLORS.length]}`}
            >
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider truncate max-w-[140px]">
                  {stage.name}
                </h3>
                <span className="text-xs font-semibold bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5 ml-2 flex-shrink-0">
                  {stage.candidates.length}
                </span>
              </div>

              <div className="flex-1 p-2 space-y-2 min-h-20">
                {stage.candidates.map(c => (
                  <CandidateCard
                    key={c.applicationId}
                    candidate={c}
                    stageId={stage.id}
                    isLastStage={isLastStage}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onViewDetails={() => navigate(`/recruiter/pipeline/candidate/${c.applicationId}`)}
                    onAddNote={() => setAddNoteModal({
                      applicationId: c.applicationId,
                      stageId:       stage.id,
                      stageName:     stage.name,
                      candidateName: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || `Candidate #${c.applicationId}`,
                    })}
                    onReject={() => rejectCandidate(c.applicationId)}
                    onHire={() => setContractTarget(c)}
                  />
                ))}
                {stage.candidates.length === 0 && (
                  <div className={`rounded-lg border-2 border-dashed ${overStage === stage.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'} p-4 text-center`}>
                    <p className="text-xs text-gray-400">Drop candidate here</p>
                  </div>
                )}
              </div>
            </div>
            );
            })}
          </div>
        </div>
      )}

      {contractTarget && (
        <ContractModal
          source="pipeline"
          sourceId={contractTarget.applicationId}
          personName={`${contractTarget.firstName ?? ''} ${contractTarget.lastName ?? ''}`.trim() || `Candidate #${contractTarget.applicationId}`}
          context={{
            job: { title: contractTarget.jobTitle },
            candidate: {
              phone: contractTarget.phone,
              email: contractTarget.email,
            },
          }}
          onClose={() => setContractTarget(null)}
          onCreated={() => { setContractTarget(null); load(); }}
        />
      )}

      {transModal && (
        <TransitionModal
          {...transModal}
          onClose={() => { setTransModal(null); load(); }}
          onConfirm={handleTransitionConfirmed}
        />
      )}

      {addNoteModal && (
        <AddNoteModal
          {...addNoteModal}
          onClose={() => setAddNoteModal(null)}
          onSaved={() => { setAddNoteModal(null); load(); }}
        />
      )}
    </RecruiterLayout>
  );
}

function CandidateCard({ candidate, stageId, isLastStage, onDragStart, onDragEnd, onViewDetails, onAddNote, onReject, onHire }) {
  const name  = `${candidate.firstName ?? ''} ${candidate.lastName ?? ''}`.trim() || `#${candidate.applicationId}`;
  const ini   = initials(candidate.firstName, candidate.lastName);
  const color = avatarColor(name);
  const isBlocked = candidate.lastNotificationRead === false;
  const readDot   = candidate.lastNotificationRead === true  ? 'bg-green-400'
                  : candidate.lastNotificationRead === false ? 'bg-red-400'
                  : null;

  return (
    <div
      draggable={!isBlocked}
      onDragStart={!isBlocked ? () => onDragStart(candidate.applicationId, stageId, candidate.firstName, candidate.lastName, candidate.lastNotificationRead) : undefined}
      onDragEnd={onDragEnd}
      title={isBlocked ? 'Move blocked — candidate must read the notification first' : undefined}
      className={`bg-white border rounded-lg p-3 shadow-sm transition-shadow select-none ${
        isBlocked
          ? 'border-amber-200 opacity-80 cursor-not-allowed'
          : 'border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-2.5 mb-2.5">
        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 relative`}>
          {ini}
          {readDot && (
            <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${readDot} border border-white`} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{name}</p>
          {isBlocked ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full mt-0.5">
              <svg className="w-2.5 h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Awaiting read
            </span>
          ) : candidate.lastNotificationRead === true ? (
            <span className="inline-block text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full mt-0.5">
              Notification read
            </span>
          ) : null}
        </div>
      </div>

      {candidate.phone && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="truncate">{candidate.phone}</span>
        </div>
      )}
      {candidate.jobTitle && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="truncate">{candidate.jobTitle}</span>
        </div>
      )}

      <div className="flex gap-1.5 mt-3">
        <button onClick={onViewDetails} className="flex-1 text-[11px] font-medium py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          View Details
        </button>
        <button onClick={onAddNote} className="flex-1 text-[11px] font-medium py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors">
          Add Note
        </button>
      </div>

      {isLastStage && (
        <div className="flex gap-1.5 mt-1.5 pt-1.5 border-t border-gray-100">
          <button
            onClick={onReject}
            className="flex-1 text-[11px] font-medium py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Rejected
          </button>
          <button
            onClick={onHire}
            className="flex-1 text-[11px] font-medium py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
          >
            Hired
          </button>
        </div>
      )}
    </div>
  );
}

function TransitionModal({ applicationId, fromStageId, toStageId, toStageName, hasCalendar, candidateName, onClose, onConfirm }) {
  const [note, setNote]           = useState('');
  const [interviewDate, setDate]  = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!note.trim()) { setError('A note is required to move this candidate.'); return; }
    setSaving(true);
    setError('');
    try {
      await onConfirm({ applicationId, fromStageId, toStageId, note: note.trim(), interviewDate: interviewDate || null });
    } catch {
      setError('Failed to move candidate. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onMouseDown={onClose}>
      <div className="bg-white w-full max-w-md border border-gray-200 shadow-xl rounded-xl overflow-hidden"
        onMouseDown={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="font-semibold text-gray-900">Move to "{toStageName}"</h3>
            <p className="text-xs text-gray-500 mt-0.5">{candidateName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transition note <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-1.5">
              Required — sent to the candidate as a notification. They must mark it as read before you can move them further.
            </p>
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              rows={4} autoFocus
              placeholder="e.g. Strong technical skills, moving to next round…"
              className="w-full border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
            />
          </div>

          {hasCalendar && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule date{' '}
                <span className="text-xs font-normal text-gray-400">(optional — notifies the candidate)</span>
              </label>
              <input type="datetime-local" value={interviewDate} onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {interviewDate && (
                <p className="text-xs text-blue-600 mt-1">The candidate will be notified of this date.</p>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors">
              {saving ? 'Moving…' : 'Confirm Move'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddNoteModal({ applicationId, stageId, stageName, candidateName, onClose, onSaved }) {
  const [note, setNote]     = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!note.trim()) { setError('Please write a note.'); return; }
    setSaving(true);
    setError('');
    try {
      await pipelineService.addNote(applicationId, stageId, note.trim());
      onSaved();
    } catch {
      setError('Failed to save note.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/75 px-4" onMouseDown={onClose}>
      <div className="bg-white w-full max-w-md border border-gray-200 shadow-xl rounded-xl overflow-hidden"
        onMouseDown={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="font-semibold text-gray-900">Stage Note</h3>
            <p className="text-xs text-gray-500 mt-0.5">{candidateName} · {stageName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          <p className="text-xs text-gray-500">This note will be saved to the candidate's application record.</p>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={4} autoFocus
            placeholder="e.g. Strong technical skills, moving to next round…"
            className="w-full border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors">
              {saving ? 'Saving…' : 'Save Note'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
