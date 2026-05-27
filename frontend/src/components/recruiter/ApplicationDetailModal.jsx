import { XMarkIcon } from '@heroicons/react/24/outline';
import { companyInitials } from '../../utils/format';
import { avatarColor, candidateName } from '../../utils/kanban';
import ApplicationStatusBadge from '../ApplicationStatusBadge';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';

export default function ApplicationDetailModal({ app, onClose, onReject }) {
  if (!app) return null;

  const name = candidateName(app);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {app.candidateAvatar ? (
              <img
                src={`${API_BASE}${app.candidateAvatar}`}
                alt=""
                className="w-12 h-12 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColor(name)}`}>
                {companyInitials(name)}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
              <p className="text-sm text-gray-500">{app.candidateHeadline || app.jobTitle}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <ApplicationStatusBadge status={app.status} />
            {app.candidateEmail && (
              <span className="text-sm text-gray-600">{app.candidateEmail}</span>
            )}
            {app.candidateLocation && (
              <span className="text-sm text-gray-500">{app.candidateLocation}</span>
            )}
          </div>

          {app.candidateBio && (
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{app.candidateBio}</p>
            </section>
          )}

          {app.coverLetter && (
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Cover letter</h3>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded-md p-4">
                {app.coverLetter}
              </div>
            </section>
          )}

          {app.resumePath ? (
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Resume</h3>
              <a
                href={`${API_BASE}${app.resumePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View resume
              </a>
            </section>
          ) : (
            <p className="text-sm text-gray-400">No resume attached to this application.</p>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          {app.status !== 'rejected' && (
            <button
              type="button"
              onClick={() => onReject(app)}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50"
            >
              Reject
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
