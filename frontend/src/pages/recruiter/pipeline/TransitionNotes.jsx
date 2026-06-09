import { useEffect, useState } from 'react';
import RecruiterLayout from '../../../components/recruiter/RecruiterLayout';
import pipelineService from '../../../services/pipelineService';

function initials(first, last) {
  return `${(first ?? '')[0] ?? ''}${(last ?? '')[0] ?? ''}`.toUpperCase() || '?';
}

const STAGE_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
];

function stageColor(stageName) {
  let h = 0;
  for (const c of stageName) h = (h * 31 + c.charCodeAt(0)) & 0xff;
  return STAGE_COLORS[h % STAGE_COLORS.length];
}

export default function TransitionNotes() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    pipelineService.getNotes()
      .then(data => setEntries(data ?? []))
      .catch(() => setError('Failed to load transition notes.'))
      .finally(() => setLoading(false));
  }, []);

  const q = search.toLowerCase().trim();
  const visible = q
    ? entries.filter(entry => {
        const name = `${entry.firstName ?? ''} ${entry.lastName ?? ''}`.toLowerCase();
        const hasNameMatch = name.includes(q);
        const hasNoteMatch = entry.notes.some(n => n.note.toLowerCase().includes(q));
        return hasNameMatch || hasNoteMatch;
      })
    : entries;

  return (
    <RecruiterLayout title="Transition Notes">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <p className="text-sm text-gray-500 flex-1 min-w-0">
          Notes written by recruiters for each stage transition.
        </p>
        <div className="relative flex-shrink-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or note…"
            className="pl-9 pr-3 py-2 border border-gray-300 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-60"
          />
        </div>
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-gray-500 hover:text-gray-700 underline">
            Clear
          </button>
        )}
      </div>

      {error   && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-400">Loading…</p>}

      {!loading && entries.length === 0 && (
        <div className="page-shell-card rounded-xl text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No transition notes yet</p>
          <p className="text-sm mt-1">Notes added via the pipeline board will appear here.</p>
        </div>
      )}

      {!loading && entries.length > 0 && visible.length === 0 && (
        <div className="page-shell-card rounded-xl text-center py-12 text-gray-400">
          <p className="text-sm">No notes match your search.</p>
        </div>
      )}

      <div className="space-y-5">
        {visible.map(entry => {
          const name = `${entry.firstName ?? ''} ${entry.lastName ?? ''}`.trim() || `Applicant #${entry.applicationId}`;
          const ini  = initials(entry.firstName, entry.lastName);
          const filteredNotes = q
            ? entry.notes.filter(n => n.note.toLowerCase().includes(q) || name.toLowerCase().includes(q))
            : entry.notes;

          return (
            <div key={entry.applicationId} className="page-shell-card rounded-xl overflow-hidden shadow-sm">
              {/* Candidate header */}
              <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-100">
                <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {ini}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{name}</p>
                  {entry.jobTitle && (
                    <p className="text-xs text-gray-500 mt-0.5">{entry.jobTitle}</p>
                  )}
                </div>
                <span className="ml-auto text-xs text-gray-400">
                  {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Notes */}
              <div className="divide-y divide-gray-100">
                {filteredNotes.map(n => (
                  <div key={n.id} className="px-5 py-4">
                    {/* Note body */}
                    <p className="text-sm text-gray-800 leading-relaxed">{n.note}</p>

                    {/* Stage + date */}
                    <div className="flex items-center gap-2 mt-2.5">
                      <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${stageColor(n.stageName)}`}>
                        {n.stageName}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </RecruiterLayout>
  );
}
