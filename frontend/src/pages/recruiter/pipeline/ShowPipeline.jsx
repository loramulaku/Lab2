import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../../components/recruiter/RecruiterLayout';
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

const BADGE_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-green-100 text-green-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
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

export default function ShowPipeline() {
  const navigate = useNavigate();
  const [board, setBoard]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [searchInput, setInput]         = useState('');
  const [error, setError]               = useState('');
  // transitionModal: { applicationId, fromStageId, toStageId, toStageName, hasCalendar, candidateName } | null
  const [transModal, setTransModal]     = useState(null);
  // addNoteModal: { applicationId, stageId, stageName, candidateName } | null
  const [addNoteModal, setAddNoteModal] = useState(null);
  const [dragCard, setDragCard]         = useState(null);
  const [overStage, setOverStage]       = useState(null);
  const debounceRef                     = useRef(null);

  const load = useCallback(async (q = search) => {
    setLoading(true);
    setError('');
    try {
      const data = await pipelineService.getBoard(q);
      setBoard(data);
    } catch (err) {
      if (err?.response?.data?.code === 'NO_PIPELINE') navigate('/recruiter/pipeline/create');
      else setError('Failed to load pipeline board.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, navigate]);

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
    // Safety net — cards with unread notifications are non-draggable but just in case
    if (dragCard.lastNotificationRead === false) { setDragCard(null); return; }
    const moved = { ...dragCard };
    setDragCard(null);
    // Open mandatory note + optional calendar modal — move only happens on confirm
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

  // After note modal confirms — optimistic move then API call
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

  if (loading && !board) return (
    <RecruiterLayout title="Pipeline Board">
      <div className="flex gap-4">
        {[1,2,3,4].map(i => <div key={i} className="flex-shrink-0 w-64 bg-gray-100 rounded-lg h-96 animate-pulse" />)}
      </div>
    </RecruiterLayout>
  );

  return (
    <RecruiterLayout title="Pipeline Board">
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="mb-5 flex items-center gap-3 flex-wrap">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
          </svg>
          <input type="text" value={searchInput} onChange={e => handleSearch(e.target.value)}
            placeholder="Search candidates…"
            className="pl-9 pr-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
        </div>
        {searchInput && (
          <button onClick={() => { setInput(''); setSearch(''); }} className="text-xs text-gray-500 hover:text-gray-700 underline">
            Clear
          </button>
        )}
        <div className="text-xs text-gray-400 ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
            Read — can move
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
            Unread — move blocked
          </span>
          <span className="text-gray-300">|</span>
          <span>Note required on every move</span>
        </div>
      </div>

      {board && (
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[70vh] items-start">
          {board.stages.map((stage, si) => (
            <div
              key={stage.id}
              onDragOver={e => onDragOver(e, stage.id)}
              onDrop={e => onDrop(e, stage)}
              className={`flex-shrink-0 w-64 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col transition-all duration-150 ${
                overStage === stage.id ? 'ring-2 ring-blue-400 bg-blue-50/30' : ''
              } border-t-4 ${STAGE_COLORS[si % STAGE_COLORS.length].column}`}
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
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onViewDetails={() => navigate(`/recruiter/pipeline/candidate/${c.applicationId}`)}
                    onAddNote={() => setAddNoteModal({
                      applicationId: c.applicationId,
                      stageId:       stage.id,
                      stageName:     stage.name,
                      candidateName: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || `Candidate #${c.applicationId}`,
                    })}
                  />
                ))}
                {stage.candidates.length === 0 && (
                  <div className={`rounded-lg border-2 border-dashed ${overStage === stage.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'} p-4 text-center`}>
                    <p className="text-xs text-gray-400">Drop candidate here</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
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

function CandidateCard({ candidate, stageId, onDragStart, onDragEnd, onViewDetails, onAddNote }) {
  const name  = `${candidate.firstName ?? ''} ${candidate.lastName ?? ''}`.trim() || `#${candidate.applicationId}`;
  const ini   = initials(candidate.firstName, candidate.lastName);
  const color = avatarColor(name);
  const badge = BADGE_COLORS[stageIndex % BADGE_COLORS.length];

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
        <button onClick={onViewDetails} className="flex-1 text-[11px] font-medium py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded transition-colors">
          View Details
        </button>
        <button onClick={onAddNote} className="flex-1 text-[11px] font-medium py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded transition-colors">
          Add Note
        </button>
      </div>
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
              className="w-full border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            />
          </div>

          {hasCalendar && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule date{' '}
                <span className="text-xs font-normal text-gray-400">(optional — notifies the candidate)</span>
              </label>
              <input type="datetime-local" value={interviewDate} onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded" />
              {interviewDate && (
                <p className="text-xs text-blue-600 mt-1">
                  The candidate will be notified of this date in real time.
                </p>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 rounded">
              {saving ? 'Moving…' : 'Confirm Move'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 rounded">
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
          <p className="text-xs text-gray-500">
            This note will be saved to the candidate's application record.
          </p>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={4} autoFocus
            placeholder="e.g. Strong technical skills, moving to next round…"
            className="w-full border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 rounded">
              {saving ? 'Saving…' : 'Save Note'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 rounded">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
