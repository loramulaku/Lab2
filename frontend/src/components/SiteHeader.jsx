import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BellIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import {
  getPrimaryNav,
  getGuestNav,
  isNavActive,
} from '../constants/appNavigation';
import useInboxCounts from '../hooks/useInboxCounts';
import BrandLogo from './BrandLogo';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';

const ROLE_BADGE = {
  candidate: 'bg-brand-50 text-brand-700 border-brand-100',
  recruiter: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  admin: 'bg-violet-50 text-violet-700 border-violet-100',
};

function Avatar({ src, firstName, lastName, size = 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';
  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?';

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${dim} rounded-full object-cover ring-2 ring-gray-100 shrink-0`}
      />
    );
  }

  return (
    <div className={`${dim} rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-semibold text-gray-600 shrink-0`}>
      {initials}
    </div>
  );
}

function NavItem({ item, pathname }) {
  const active = isNavActive(pathname, item.href);
  const className = active ? 'nav-pill-active' : 'nav-pill-inactive';

  if (item.anchor) {
    return (
      <Link to={item.href} className={className}>
        {item.label}
      </Link>
    );
  }

  return (
    <Link to={item.href} className={className}>
      {item.label}
    </Link>
  );
}

function InboxLink({ to, badge, label, children, showLabel = false }) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className="relative flex items-center gap-1.5 px-2 py-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      {children}
      {showLabel && (
        <span className="hidden lg:inline text-sm font-medium">{label}</span>
      )}
      {badge > 0 && (
        <span className="absolute top-1 right-1 min-w-[1rem] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
}

/**
 * Single header for the whole product — guest, candidate, and recruiter.
 * Same look, same position; nav adapts to auth + role.
 */
export default function SiteHeader() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, messages } = useInboxCounts();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAuthed = Boolean(token);
  const roles = user?.roles ?? [];
  const navItems = isAuthed ? getPrimaryNav(roles) : getGuestNav(location.pathname);

  const primaryRole = roles.includes('recruiter')
    ? 'recruiter'
    : roles.includes('candidate')
      ? 'candidate'
      : roles.includes('admin')
        ? 'admin'
        : null;

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User';
  const avatarSrc = user?.avatarPath ? `${API_BASE}${user.avatarPath}` : null;

  useEffect(() => {
    function onClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
      <div className="page-container h-16 flex items-center gap-4">
        <BrandLogo compact />

        <nav className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 justify-center max-w-3xl mx-auto">
          {navItems.map((item) => (
            <NavItem key={item.href + item.label} item={item} pathname={location.pathname} />
          ))}
        </nav>

        <div className="flex items-center gap-1 shrink-0 ml-auto md:ml-0">
          {isAuthed ? (
            <>
              <InboxLink to="/notifications" badge={notifications} label="Notifications" showLabel>
                <BellIcon className="w-5 h-5" />
              </InboxLink>
              <InboxLink to="/messages" badge={messages} label="Messages" showLabel>
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
              </InboxLink>

              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Avatar src={avatarSrc} firstName={user?.firstName} lastName={user?.lastName} />
                  <span className="hidden sm:block text-sm font-semibold text-gray-900 max-w-[6rem] truncate">
                    {user?.firstName ?? 'User'}
                  </span>
                  {primaryRole && (
                    <span className={`hidden lg:inline text-[11px] font-medium px-2 py-0.5 rounded-full border ${ROLE_BADGE[primaryRole]}`}>
                      {primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1)}
                    </span>
                  )}
                  <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white shadow-xl border border-gray-100 overflow-hidden animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                      <p className="text-sm font-semibold text-gray-900 truncate">{fullName}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email ?? ''}</p>
                    </div>

                    <div className="py-1.5 border-b border-gray-100">
                      <Link
                        to="/messages"
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span className="flex items-center gap-3">
                          <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-400" />
                          Messages
                        </span>
                        {messages > 0 && (
                          <span className="text-xs font-semibold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                            {messages}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/notifications"
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span className="flex items-center gap-3">
                          <BellIcon className="w-4 h-4 text-gray-400" />
                          Notifications
                        </span>
                        {notifications > 0 && (
                          <span className="text-xs font-semibold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                            {notifications}
                          </span>
                        )}
                      </Link>
                    </div>

                    <div className="py-1.5 md:hidden border-b border-gray-100">
                      {navItems.map((item) => (
                        <Link
                          key={item.href + item.label}
                          to={item.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    <div className="py-1.5">
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Cog6ToothIcon className="w-4 h-4 text-gray-400" />
                        Settings
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 py-1.5">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost hidden sm:inline-flex">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
