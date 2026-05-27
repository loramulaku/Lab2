import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BellIcon,
  CheckIcon,
  BriefcaseIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import SiteLayout from '../../components/SiteLayout';
import PageHeader from '../../components/PageHeader';
import { PageError } from '../../components/PageFeedback';
import notificationService from '../../services/notificationService';
import { formatRelativeTime } from '../../utils/format';
import { getNotificationHref } from '../../constants/appNavigation';
import { useAuth } from '../../context/AuthContext';

const TYPE_STYLES = {
  application: { icon: BriefcaseIcon, cls: 'bg-brand-50 text-brand-600' },
  message: { icon: ChatBubbleLeftRightIcon, cls: 'bg-violet-50 text-violet-600' },
  profile: { icon: UserIcon, cls: 'bg-emerald-50 text-emerald-600' },
  default: { icon: BellIcon, cls: 'bg-gray-100 text-gray-600' },
};

function groupByDate(notifications) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups = { Today: [], Yesterday: [], Earlier: [] };

  notifications.forEach((n) => {
    const d = new Date(n.createdAt ?? 0);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) groups.Today.push(n);
    else if (d.getTime() === yesterday.getTime()) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  });

  return groups;
}

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    notificationService
      .getNotifications()
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setError('Unable to load notifications right now.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const groups = groupByDate(notifications);
  const isRecruiter = user?.roles?.includes('recruiter');

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkRead = async (id) => {
    await notificationService.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleNotificationClick = async (notification) => {
    const href = getNotificationHref(notification, user?.roles ?? []);
    if (!notification.isRead) {
      await handleMarkRead(notification.id);
    }
    if (href) navigate(href);
  };

  return (
    <SiteLayout>
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Notifications"
          subtitle="Application updates, messages, and account activity."
          className="mb-8"
          actions={unreadCount > 0 ? (
            <button type="button" onClick={handleMarkAllRead} className="btn-secondary text-xs shrink-0">
              <CheckIcon className="w-4 h-4" />
              Mark all read
            </button>
          ) : null}
        />

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="surface h-20 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <PageError message={error} onRetry={load} />
        ) : notifications.length === 0 ? (
          <div className="surface py-16 px-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <BellIcon className="w-7 h-7 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">All caught up</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
              When someone applies to your jobs, sends a message, or your application status
              changes, you&apos;ll see it here.
            </p>
            <Link to={isRecruiter ? '/recruiter/applications' : '/jobs'} className="btn-primary mt-6 inline-flex">
              {isRecruiter ? 'Open applications' : 'Browse jobs'}
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groups).map(([label, items]) =>
              items.length === 0 ? null : (
                <section key={label}>
                  <h2 className="section-label mb-3">{label}</h2>
                  <ul className="space-y-2">
                    {items.map((n) => {
                      const style = TYPE_STYLES[n.type] ?? TYPE_STYLES.default;
                      const Icon = style.icon;
                      const href = getNotificationHref(n, user?.roles ?? []);
                      const Wrapper = href ? 'button' : 'div';

                      return (
                        <li key={n.id}>
                          <Wrapper
                            type={href ? 'button' : undefined}
                            onClick={href ? () => handleNotificationClick(n) : undefined}
                            className={`surface p-4 flex gap-4 w-full text-left transition-all duration-150 ${
                              href ? 'hover:border-gray-300 hover:shadow-sm cursor-pointer' : ''
                            } ${!n.isRead ? 'border-brand-200 bg-brand-50/30' : ''}`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.cls}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${n.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                                {n.message ?? n.title ?? 'Notification'}
                              </p>
                              {n.createdAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatRelativeTime(n.createdAt)}
                                </p>
                              )}
                            </div>
                            {!n.isRead && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkRead(n.id);
                                }}
                                className="text-xs font-medium text-brand-600 hover:text-brand-700 shrink-0 self-start"
                              >
                                Mark read
                              </button>
                            )}
                          </Wrapper>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )
            )}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
