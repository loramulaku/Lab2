import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { usePageSection } from '../context/ThemeContext';
import candidateService from '../services/candidateService';
import FreelanceToggle from './freelance/FreelanceToggle';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';

// ── Icons ─────────────────────────────────────────────────────────────────────

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-10-2h4v2h-4V5z"/>
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>
);

const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5v-2h2v2zm4 4H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V5h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V5h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/>
  </svg>
);

const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const SignOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
  </svg>
);

const ChevronDownIcon = ({ open }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
  </svg>
);

// ── Constants ─────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Home',        href: '/'     },
  { label: 'Browse Jobs', href: '/jobs' },
  { label: 'Contact',     href: '/contact' },
];

const ROLE_LABEL = {
  candidate: 'Candidate',
  recruiter: 'Recruiter',
  admin:     'Admin',
};

// ── Role-aware dropdown menu items ────────────────────────────────────────────

function getMenuItems(roles = []) {
  const has = (r) => roles.includes(r);
  const items = [];
  if (has('candidate') || has('admin')) {
    items.push({ label: 'My Profile',   href: '/my-profile',       icon: <UserIcon /> });
  }
  if (has('recruiter') || has('admin')) {
    items.push({ label: 'Company Page', href: '/recruiter/company', icon: <BuildingIcon /> });
  }
  const dashboardHref = has('admin') ? '/admin'
    : has('recruiter') ? '/recruiter/dashboard'
    : '/my-profile';
  items.push({ label: 'Dashboard', href: dashboardHref, icon: <GridIcon /> });
  return items;
}

// ── Avatar fallback (initials) ────────────────────────────────────────────────

function Avatar({ src, firstName, lastName, size = 'md' }) {
  const dim    = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?';

  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        className={`${dim} rounded-full object-cover ring-2 ring-white flex-shrink-0`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full bg-blue-600 flex items-center justify-center font-semibold text-white flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Header() {
  const { user, logout }  = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const siteS             = usePageSection('global', 'site-identity');
  const navigate          = useNavigate();
  const location          = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bellOpen, setBellOpen]         = useState(false);
  const [freelanceActive, setFreelanceActive] = useState(null);
  const dropdownRef = useRef(null);
  const bellRef     = useRef(null);

  const isCandidate = (user?.roles ?? []).includes('candidate');

  useEffect(() => {
    let cancelled = false;
    if (isCandidate) {
      candidateService.getProfile()
        .then(p => { if (!cancelled) setFreelanceActive(!!p.freelanceActive); })
        .catch(() => {});
    }
    return () => { cancelled = true; };
  }, [isCandidate]);

  useEffect(() => {
    function onClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (bellRef.current    && !bellRef.current.contains(e.target))     setBellOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => { setDropdownOpen(false); setBellOpen(false); }, [location.pathname]);

  const handleFreelanceToggle = async (next) => {
    await candidateService.setFreelanceMode(next);
    setFreelanceActive(next);
  };

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const roles       = user?.roles ?? [];
  const primaryRole = roles[0] ?? 'candidate';
  const roleLabel   = ROLE_LABEL[primaryRole] ?? ROLE_LABEL.candidate;
  const fullName    = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User';
  const displayName = fullName !== roleLabel ? fullName : (user?.email?.split('@')[0] ?? fullName);
  const avatarSrc   = user?.avatarPath ? `${API_BASE}${user.avatarPath}` : null;
  const menuItems   = getMenuItems(roles);

  const iconBtn =
    'page-shell-btn relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-blue-700 hover:bg-white/50 transition-all';

  return (
    <header className="fixed top-0 inset-x-0 z-50 page-shell-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="page-shell-btn bg-blue-600 text-white rounded-xl p-1.5 group-hover:bg-blue-500 transition-all">
            <BriefcaseIcon />
          </div>
          <span className="text-gray-900 font-bold text-lg tracking-tight">
            {siteS.siteName || (
              <>Hire<span className="text-blue-600">Wire</span></>
            )}
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center justify-center gap-6">
          {[
            { label: siteS.nav1Label || NAV_LINKS[0].label, href: NAV_LINKS[0].href },
            { label: siteS.nav2Label || NAV_LINKS[1].label, href: NAV_LINKS[1].href },
            { label: siteS.nav3Label || NAV_LINKS[2].label, href: NAV_LINKS[2].href },
          ].map(({ label, href }) => {
            const active = location.pathname === href;
            return (
              <Link
                key={href}
                to={href}
                className={`relative py-1 text-sm transition-colors ${
                  active
                    ? 'text-blue-700 font-medium'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {label}
                {active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center justify-end gap-0.5 sm:gap-1">

          {/* ── Notification bell ── */}
          <div className="relative" ref={bellRef}>
            <button
              className={iconBtn}
              aria-label="Notifications"
              onClick={() => setBellOpen(o => !o)}
            >
              <BellIcon />
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
                          <div className="flex items-center justify-between mt-0.5 gap-2">
                            <p className="text-xs text-gray-400">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                            {n.link && (
                              <span className="text-xs text-indigo-600 font-medium whitespace-nowrap">
                                View →
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button className={iconBtn} aria-label="Messages">
            <ChatIcon />
          </button>

          <div className="hidden sm:block w-px h-6 bg-blue-200/60 mx-1.5" aria-hidden />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="page-shell-btn flex items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 hover:bg-white/50 transition-all"
            >
              <Avatar
                src={avatarSrc}
                firstName={user?.firstName}
                lastName={user?.lastName}
                size="sm"
              />
              <span className="hidden sm:block text-sm text-gray-700 max-w-[6.5rem] truncate">
                {displayName}
              </span>
              <span className="text-gray-400">
                <ChevronDownIcon open={dropdownOpen} />
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden animate-fade-in">

                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email ?? ''}</p>
                  <p className="text-xs text-gray-400 mt-1">{roleLabel}</p>
                </div>

                <div className="py-1.5">
                  {menuItems.map(({ label, href, icon }) => (
                    <Link
                      key={href}
                      to={href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <span className="text-gray-400">{icon}</span>
                      {label}
                    </Link>
                  ))}
                </div>

                {isCandidate && freelanceActive !== null && (
                  <div className="border-t border-gray-100 py-1.5">
                    <FreelanceToggle compact active={freelanceActive} onChange={handleFreelanceToggle} />
                  </div>
                )}

                <div className="border-t border-gray-100 py-1.5">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="text-red-500"><SignOutIcon /></span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
