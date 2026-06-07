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

  useEffect(() => {
    pipelineService.getNotes()
      .then(data => setEntries(data ?? []))
      .catch(() => setError('Failed to load transition notes.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <RecruiterLayout title="Transition Notes">
      <p className="text-sm text-gray-500 mb-6">
        Notes written by recruiters for each stage — delivered to candidates as notifications and stored here.
      </p>

      {error   && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-400">Loading…</p>}

      {!loading && entries.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No transition notes yet</p>
          <p className="text-sm mt-1">Notes added via the pipeline board will appear here.</p>
        </div>
      )}

      <div className="space-y-5">
        {entries.map(entry => {
          const name = `${entry.firstName ?? ''} ${entry.lastName ?? ''}`.trim() || `Applicant #${entry.applicationId}`;
          const ini  = initials(entry.firstName, entry.lastName);

          return (
            <div key={entry.applicationId} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
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
                  {entry.notes.length} note{entry.notes.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Notes */}
              <div className="divide-y divide-gray-100">
                {entry.notes.map(n => (
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
