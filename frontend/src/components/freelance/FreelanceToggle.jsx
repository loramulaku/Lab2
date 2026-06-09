import { useState } from 'react';

/**
 * Reusable "Activate Freelance" toggle.
 * Used on the candidate profile page and (compact) in the header nav menu.
 *
 * Props:
 *   active   : boolean        current state
 *   onChange : (next) => Promise   called with the desired next value
 *   compact  : boolean        small variant for menus
 */
export default function FreelanceToggle({ active, onChange, compact = false }) {
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try { await onChange(!active); }
    finally { setBusy(false); }
  };

  if (compact) {
    return (
      <button
        onClick={toggle}
        disabled={busy}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors disabled:opacity-50"
      >
        <span className="flex items-center gap-3">
          <span className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          {active ? 'Freelance: On' : 'Activate Freelance'}
        </span>
        <Switch on={active} />
      </button>
    );
  }

  return (
    <div className="page-shell-card rounded-xl p-5 mb-4 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Freelance Mode</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {active
              ? 'You are discoverable to recruiters and can bid on freelance jobs.'
              : 'Activate to bid on freelance jobs and receive direct invitations from recruiters.'}
          </p>
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={busy}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition disabled:opacity-50 rounded-lg ${
          active
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'border border-indigo-300 text-indigo-700 hover:bg-indigo-50'
        }`}
      >
        <Switch on={active} />
        {busy ? 'Saving…' : active ? 'Activated' : 'Activate Freelance'}
      </button>
    </div>
  );
}

function Switch({ on }) {
  return (
    <span className={`relative inline-block w-9 h-5 rounded-full transition ${on ? 'bg-white/40' : 'bg-gray-300'}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : ''}`} />
    </span>
  );
}
