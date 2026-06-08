import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  List, Archive,
  Users, KanbanSquare, StickyNote,
  Gavel, Send, UserCheck, FileText,
  MessageCircle, Bell,
  CreditCard, ArrowUpCircle, Receipt,
  UsersRound,
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
    <div className="min-h-screen flex bg-gray-100">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0c1322] flex flex-col select-none">

        {/* Brand */}
        <div className="flex items-center gap-2 px-4 pt-5 pb-3 flex-shrink-0">
          <span className="text-[20px] font-semibold text-white leading-none">HireWire</span>
          <span className="text-[13px] text-[#85b7eb] leading-none">Recruiter</span>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 sidebar-scrollbar">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-3' : ''}>
              {group.title && (
                <p className="px-2.5 mb-1 mt-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#5f7494]">
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
                          ? 'bg-[#378add] text-white'
                          : item.teal
                            ? 'text-[#9fe1cb] hover:bg-white/5 hover:text-white'
                            : 'text-[#cfe0f5] hover:bg-white/5 hover:text-white',
                      ].join(' ')}
                    >
                      <Icon size={17} className="flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="ml-auto bg-[#1d9e75] text-white text-[11px] font-semibold px-[7px] py-px rounded-full leading-[1.4] flex-shrink-0">
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
        <div className="flex-shrink-0 border-t border-[#28324a] px-3 py-3 space-y-0.5">
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
                    ? 'bg-[#378add] text-white'
                    : 'text-[#8aa0c0] hover:bg-white/5 hover:text-white',
                ].join(' ')}
              >
                <Icon size={17} className="flex-shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[14px] font-[450] text-[#8aa0c0] hover:bg-white/5 hover:text-white transition-colors duration-100"
          >
            <LogOut size={17} className="flex-shrink-0" aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-14 bg-white shadow-sm items-center justify-between px-8 border-b border-gray-100">
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
