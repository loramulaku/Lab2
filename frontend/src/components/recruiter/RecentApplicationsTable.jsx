import ApplicationStatusBadge from '../ApplicationStatusBadge';
import { companyInitials } from '../../utils/format';

function CandidateAvatar({ firstName, lastName, avatarPath }) {
  const initials = companyInitials([firstName, lastName].filter(Boolean).join(' ') || '?');
  const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';

  if (avatarPath) {
    return (
      <img
        src={`${API_BASE}${avatarPath}`}
        alt=""
        className="w-9 h-9 rounded-full object-cover border border-gray-200"
      />
    );
  }

  return (
    <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
      {initials}
    </div>
  );
}

function formatAppliedDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function RecentApplicationsTable({
  applications,
  loading,
  onView,
  onAccept,
  onReject,
  updatingId,
}) {
  if (loading) {
    return (
      <div className="border border-gray-200 rounded-md bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex gap-4 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-md bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">Recent applications</h2>
      </div>

      {applications.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-gray-500">
          No applications in this period yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Candidate</th>
                <th className="px-5 py-3 font-medium">Job</th>
                <th className="px-5 py-3 font-medium">Applied</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => {
                const name = [app.candidateFirstName, app.candidateLastName]
                  .filter(Boolean)
                  .join(' ') || 'Candidate';
                const isUpdating = updatingId === app.id;

                return (
                  <tr
                    key={app.id}
                    className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-colors ${
                      index % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <CandidateAvatar
                          firstName={app.candidateFirstName}
                          lastName={app.candidateLastName}
                          avatarPath={app.candidateAvatar}
                        />
                        <span className="font-medium text-gray-900">{name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{app.jobTitle}</td>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                      {formatAppliedDate(app.appliedAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onView(app)}
                          disabled={isUpdating}
                          className="text-xs font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-200/60 transition-colors disabled:opacity-50"
                        >
                          View
                        </button>
                        {app.status !== 'accepted' && (
                          <button
                            type="button"
                            onClick={() => onAccept(app)}
                            disabled={isUpdating}
                            className="text-xs font-medium text-green-700 hover:text-green-800 px-2 py-1 rounded-md hover:bg-green-50 transition-colors disabled:opacity-50"
                          >
                            Accept
                          </button>
                        )}
                        {app.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => onReject(app)}
                            disabled={isUpdating}
                            className="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
