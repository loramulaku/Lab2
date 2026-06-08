import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageBackground } from '../layout';
import {
  LayoutDashboard,
  List, Archive,
  Users, KanbanSquare, StickyNote,
  Gavel, Send, UserCheck, FileText,
  MessageCircle, Bell,
  CreditCard, ArrowUpCircle, Receipt,
  UsersRound, BadgeCheck,
  Settings, LogOut,
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
      { label: 'Invoices & billing', to: '/recruiter/billing/invoices', icon: Receipt },
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

// ── RecruiterLayout ───────────────────────────────────────────────────────────
export default function RecruiterLayout({ children, title }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (item) => {
    const base = (item.match ?? item.to).split('?')[0];
    if (base === '__never__') return false;
    if (base === '/recruiter/jobs') return location.pathname === '/recruiter/jobs';
    return location.pathname === base || location.pathname.startsWith(base + '/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex relative">
      <PageBackground />

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white/60 backdrop-blur-xl border-r border-blue-200/50 flex flex-col select-none">

        {/* Brand */}
        <div className="flex items-center gap-2 px-4 pt-5 pb-3 flex-shrink-0">
          <span className="text-[20px] font-semibold text-gray-900 leading-none">HireWire</span>
          <span className="text-[13px] text-blue-500 leading-none">Recruiter</span>
        </div>

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
          <div className="flex items-center gap-5">
            <Link
              to="/recruiter/company"
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              Company Profile
            </Link>
            <span className="text-sm font-medium text-gray-700">{user?.firstName ?? 'Recruiter'}</span>
          </div>
        </div>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
