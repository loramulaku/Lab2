import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import { useNotifications } from '../../hooks/useNotifications';

const TYPE_LABELS = {
  pipeline_stage_change: 'Pipeline move',
  interview_scheduled:   'Interview scheduled',
  application_received:  'New application',
  bid_received:          'Bid received',
  invitation_accepted:   'Invitation accepted',
  invitation_rejected:   'Invitation rejected',
};

const TYPE_COLORS = {
  pipeline_stage_change: 'bg-blue-100 text-blue-700',
  interview_scheduled:   'bg-purple-100 text-purple-700',
  application_received:  'bg-green-100 text-green-700',
  bid_received:          'bg-amber-100 text-amber-700',
  invitation_accepted:   'bg-teal-100 text-teal-700',
  invitation_rejected:   'bg-rose-100 text-rose-700',
};

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function RecruiterNotifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <RecruiterLayout title="Notifications">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
            : 'All notifications read'}
        </p>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-gray-200 text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-sm mt-1">Notifications will appear here as activity happens.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`bg-white border px-5 py-4 flex items-start gap-4 ${
                n.isRead ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              {/* Unread dot */}
              <div className="flex-shrink-0 mt-1">
                {n.isRead
                  ? <span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block" />
                  : <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[n.type] ?? 'bg-gray-100 text-gray-600'}`}>
                    {TYPE_LABELS[n.type] ?? n.type}
                  </span>
                  <span className="text-xs text-gray-400">{fmtDate(n.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">{n.message}</p>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="flex-shrink-0 text-xs text-blue-600 hover:underline whitespace-nowrap self-center"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </RecruiterLayout>
  );
}
