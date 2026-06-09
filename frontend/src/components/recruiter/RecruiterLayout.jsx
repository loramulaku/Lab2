import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { PageBackground } from '../layout';
import {
  LayoutDashboard,
  List, Archive,
  Users, KanbanSquare, StickyNote,
  Gavel, Send, UserCheck, FileText,
  MessageCircle, Bell,
  CreditCard, ArrowUpCircle, Receipt,
  UsersRound, BadgeCheck,
  Settings, LogOut, Briefcase,
  Globe, Building2, ChevronDown,
} from 'lucide-react';

// ── Nav data ──────────────────────────────────────────────────────────────────
// Each item: { label, to, icon, match?, teal?, badge? }
// "match" overrides the path used for active detection (strips query string by default).
// "teal" makes the resting text colour teal instead of blue-grey.
// "badge" renders an emerald pill with the given count.
const NAV_GROUPS = [
  {
    title: null,
    items: [
      { label: 'Overview', to: '/recruiter/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'JOBS',
    items: [
      { label: 'My job listings', to: '/recruiter/jobs',        match: '/recruiter/jobs', icon: List },
      { label: 'Archived jobs',   to: '/recruiter/jobs/archived',                         icon: Archive },
    ],
  },
  {
    title: 'STANDARD HIRING',
    items: [
      { label: 'Applicants',       to: '/recruiter/applicants/job-seekers', icon: Users },
      { label: 'Hiring pipeline',  to: '/recruiter/pipeline/board',         icon: KanbanSquare },
      { label: 'Transition notes', to: '/recruiter/pipeline/notes',         icon: StickyNote },
    ],
  },
  {
    title: 'FREELANCE HIRING',
    items: [
      { label: 'Bids received',       to: '/recruiter/bids',                icon: Gavel },
      { label: 'Invited freelancers', to: '/recruiter/freelancers/invited', icon: Send },
      { label: 'Active freelancers',  to: '/recruiter/freelancers/active',  icon: UserCheck },
      { label: 'Contracts',           to: '/recruiter/contracts',           icon: FileText },
    ],
  },
  {
    title: 'HIRED',
    items: [
      { label: 'Hired', to: '/recruiter/hired', icon: BadgeCheck },
    ],
  },
  {
    title: 'COMMUNICATION',
    items: [
      { label: 'Messages',      to: '/chat',                    icon: MessageCircle, teal: true },
      { label: 'Notifications', to: '/recruiter/notifications', icon: Bell,          teal: true },
    ],
  },
  {
    title: 'BILLING & PLAN',
    items: [
      { label: 'My current plan',    to: '/recruiter/billing/plan',     icon: CreditCard },
      { label: 'Buy / upgrade plan', to: '/recruiter/billing/upgrade',  icon: ArrowUpCircle },
      { label: 'Payment logs',       to: '/recruiter/billing/invoices', icon: Receipt },
    ],
  },
  {
    title: 'TEAM',
    items: [
      { label: 'Team members', to: '/recruiter/users', icon: UsersRound },
    ],
  },
];

const BOTTOM_ITEMS = [
  { label: 'Settings', to: '/recruiter/settings', icon: Settings },
];

// ── Avatar initials fallback ──────────────────────────────────────────────────
function Avatar({ firstName, lastName }) {
  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?';
  return (
    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
      {initials}
    </div>
  );
}

// ── RecruiterLayout ───────────────────────────────────────────────────────────
export default function RecruiterLayout({ children, title }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bellOpen,     setBellOpen]     = useState(false);
  const dropdownRef = useRef(null);
  const bellRef     = useRef(null);

  useEffect(() => {
    function onOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (bellRef.current    && !bellRef.current.contains(e.target))     setBellOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  useEffect(() => { setDropdownOpen(false); setBellOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const isActive = (item) => {
    const base = (item.match ?? item.to).split('?')[0];
    if (base === '__never__') return false;
    if (base === '/recruiter/jobs') return location.pathname === '/recruiter/jobs';
    return location.pathname === base || location.pathname.startsWith(base + '/');
  };

  return (
    <div className="min-h-screen flex relative">
      <PageBackground />

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white/60 backdrop-blur-xl border-r border-blue-200/50 flex flex-col select-none">

        {/* Brand — matches the public header logo, links back to the dashboard */}
        <Link to="/recruiter/dashboard" className="flex items-center gap-2.5 px-4 pt-5 pb-3 flex-shrink-0 group">
          <span className="bg-blue-600 text-white rounded-xl p-1.5 group-hover:bg-blue-500 transition-colors">
            <Briefcase size={18} />
          </span>
          <span className="text-[19px] font-bold tracking-tight text-gray-900 leading-none">
            Hire<span className="text-blue-600">Wire</span>
          </span>
          <span className="text-[11px] font-medium text-blue-500 bg-blue-50 rounded px-1.5 py-0.5 leading-none">Recruiter</span>
        </Link>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 sidebar-scrollbar-light">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-3' : ''}>
              {group.title && (
                <p className="px-2.5 mb-1 mt-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-gray-400">
                  {group.title}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const active = isActive(item);
                  const Icon   = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={[
                        'flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[14px] font-[450] transition-colors duration-100',
                        active
                          ? 'bg-blue-600 text-white shadow-sm'
                          : item.teal
                            ? 'text-teal-600 hover:bg-teal-100/60 hover:text-teal-700'
                            : 'text-gray-600 hover:bg-blue-100/60 hover:text-blue-700',
                      ].join(' ')}
                    >
                      <Icon size={17} className="flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="ml-auto bg-emerald-100 text-emerald-700 text-[11px] font-semibold px-[7px] py-px rounded-full leading-[1.4] flex-shrink-0">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: Settings + Log out */}
        <div className="flex-shrink-0 border-t border-blue-200/50 px-3 py-3 space-y-0.5">
          {BOTTOM_ITEMS.map(item => {
            const active = isActive(item);
            const Icon   = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={[
                  'flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[14px] font-[450] transition-colors duration-100',
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-blue-100/60 hover:text-blue-700',
                ].join(' ')}
              >
                <Icon size={17} className="flex-shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[14px] font-[450] text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-100"
          >
            <LogOut size={17} className="flex-shrink-0" aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen min-w-0 relative z-10">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-14 page-shell-bar items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-gray-800">{title ?? 'Recruiter Dashboard'}</h1>

          <div className="flex items-center gap-1">

            {/* Browse Jobs */}
            <Link
              to="/jobs"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-blue-700 hover:bg-blue-50/60 rounded-lg transition-colors"
            >
              <Globe size={15} />
              Browse Jobs
            </Link>

            <div className="w-px h-5 bg-blue-200/50 mx-1" aria-hidden />

            {/* Notification bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setBellOpen(o => !o)}
                className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-50/60 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">Notifications</p>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">No notifications yet.</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.isRead) markAsRead(n.id);
                            setBellOpen(false);
                            if (n.link) navigate(n.link);
                          }}
                          className={`flex gap-3 px-4 py-3 transition-colors ${n.link ? 'cursor-pointer hover:bg-gray-50' : ''} ${n.isRead ? '' : 'bg-indigo-50/60'}`}
                        >
                          <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.isRead ? 'bg-gray-200' : 'bg-indigo-500'}`} />
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm leading-snug ${n.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                              {n.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-blue-50/60 transition-colors"
              >
                <Avatar firstName={user?.firstName} lastName={user?.lastName} />
                <span className="text-sm font-medium text-gray-700 max-w-[7rem] truncate">
                  {user?.firstName ?? 'Recruiter'}
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden animate-fade-in z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Recruiter'}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email ?? ''}</p>
                  </div>
                  <div className="py-1.5">
                    <Link
                      to="/jobs"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <BrowseIcon size={15} className="text-gray-400" />
                      Browse Jobs
                    </Link>
                    <Link
                      to="/recruiter/company"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <Building2 size={15} className="text-gray-400" />
                      Company Profile
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 py-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} className="text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
