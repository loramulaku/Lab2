import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

const GearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
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
  { label: 'Full-time', href: '/jobs/full-time'  },
  { label: 'Part-time', href: '/jobs/part-time'  },
  { label: 'Freelance', href: '/jobs/freelance'  },
];

const ROLE_BADGE = {
  candidate: { label: 'Candidate', cls: 'bg-blue-500/30 text-blue-100 border border-blue-400/40'  },
  recruiter:  { label: 'Recruiter', cls: 'bg-green-500/30 text-green-100 border border-green-400/40' },
  admin:      { label: 'Admin',     cls: 'bg-purple-500/30 text-purple-100 border border-purple-400/40' },
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
  items.push(
    { label: 'Dashboard', href: '/dashboard', icon: <GridIcon /> },
    { label: 'Settings',  href: '/settings',  icon: <GearIcon /> },
  );
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
        className={`${dim} rounded-full object-cover ring-2 ring-white/20 flex-shrink-0`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full bg-blue-500/40 border border-blue-400/40 flex items-center justify-center font-semibold text-white flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Header({ notificationCount = 0 }) {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const location          = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef                     = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => { setDropdownOpen(false); }, [location.pathname]);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const roles      = user?.roles ?? [];
  const primaryRole = roles[0] ?? 'candidate';
  const badge      = ROLE_BADGE[primaryRole] ?? ROLE_BADGE.candidate;
  const fullName   = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User';
  const avatarSrc  = user?.avatarPath ? `${API_BASE}${user.avatarPath}` : null;
  const menuItems  = getMenuItems(roles);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-blue-950/80 backdrop-blur-md backdrop-saturate-150 border-b border-blue-800/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="bg-blue-500 rounded-xl p-1.5 group-hover:bg-blue-400 transition">
            <BriefcaseIcon />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Hire<span className="text-blue-300">Flow</span>
          </span>
        </Link>

        {/* ── Nav links ── */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => {
            const active = location.pathname === href;
            return (
              <Link
                key={href}
                to={href}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Right side icons ── */}
        <div className="flex items-center gap-1">

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-blue-100/70 hover:bg-white/10 hover:text-white transition">
            <BellIcon />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Messages */}
          <button className="p-2 rounded-lg text-blue-100/70 hover:bg-white/10 hover:text-white transition">
            <ChatIcon />
          </button>

          {/* User profile + dropdown */}
          <div className="relative ml-2" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-white/10 transition"
            >
              <Avatar src={avatarSrc} firstName={user?.firstName} lastName={user?.lastName} />
              <span className="hidden sm:block text-sm font-semibold text-white">
                {user?.firstName ?? 'User'}
              </span>
              <span className={`hidden sm:block text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
                {badge.label}
              </span>
              <ChevronDownIcon open={dropdownOpen} />
            </button>

            {/* ── Dropdown ── */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden animate-fade-in">

                {/* User info header */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                  <p className="text-sm font-semibold text-gray-900 truncate">{fullName}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email ?? ''}</p>
                </div>

                {/* Menu items */}
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

                {/* Sign out */}
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
