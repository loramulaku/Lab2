import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const TYPE_LABEL = {
  new_message:    'Message',
  new_bid:        'Bid',
  new_invitation: 'Invitation',
  bid_accepted:   'Accepted',
  bid_rejected:   'Rejected',
};

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
  </svg>
);

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const iconBtn =
    'page-shell-btn relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-blue-700 hover:bg-white/50 transition-all';

  return (
    <div className="relative" ref={ref}>
      <button
        className={iconBtn}
        aria-label="Notifications"
        onClick={() => setOpen(o => !o)}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 && (
              <p className="px-4 py-6 text-sm text-center text-gray-400">No notifications</p>
            )}
            {notifications.map(n => (
              <div
                key={n.id}
                className={`px-4 py-3 ${n.isRead ? 'bg-white' : 'bg-blue-50'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 mb-1">
                      {TYPE_LABEL[n.type] ?? n.type}
                    </span>
                    <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="flex-shrink-0 text-xs text-blue-600 hover:underline whitespace-nowrap mt-0.5"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
