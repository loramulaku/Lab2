import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageBackground } from './shell';

const ADMIN_NAV = [
  { name: 'Dashboard',    href: '/admin',              icon: '📊' },
  { name: 'Users',        href: '/admin/users',          icon: '👥' },
  { name: 'Jobs',         href: '/admin/jobs',           icon: '💼' },
  { name: 'Companies',    href: '/admin/companies',      icon: '🏢' },
  { name: 'Applications', href: '/admin/applications',   icon: '📋' },
  { name: 'Plans',        href: '/admin/plans',          icon: '💳' },
  { name: 'Categories',   href: '/admin/categories',     icon: '🏷️' },
  { name: 'Theme Editor', href: '/admin/theme',          icon: '🎨' },
];

function isNavActive(pathname, href) {
  if (href === '/admin') return pathname === href;
  return pathname.startsWith(href);
}

function AdminSidebar({ open, onClose }) {
  const { pathname } = useLocation();
  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
        <span className="text-xl font-bold text-white">HireWire Admin</span>
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white" aria-label="Close sidebar">✕</button>
      </div>
      <nav className="mt-6 px-3">
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
              isNavActive(pathname, item.href) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
        <Link to="/jobs" className="flex items-center px-4 py-2 text-gray-300 hover:text-white transition-colors">
          <span className="mr-3">←</span><span>Back to Site</span>
        </Link>
      </div>
    </div>
  );
}

function AdminTopBar({ sidebarOpen, onOpenSidebar }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="sticky top-0 z-40 flex h-16 page-shell-bar">
      <button
        onClick={onOpenSidebar}
        className={`px-4 text-gray-500 focus:outline-none lg:hidden ${sidebarOpen ? 'hidden' : ''}`}
        aria-label="Open sidebar"
      >
        <span className="text-2xl">☰</span>
      </button>
      <div className="flex-1 flex justify-between items-center px-6 sm:px-8">
        <h1 className="text-lg font-semibold text-gray-800">Admin Panel</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Administrator</span>
          <button onClick={async () => { await logout(); navigate('/login', { replace: true }); }} className="text-sm text-red-600 hover:text-red-700">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen isolate">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`relative z-10 transition-[padding] duration-200 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
        <AdminTopBar sidebarOpen={sidebarOpen} onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="relative isolate p-6 sm:p-8 min-h-[calc(100vh-4rem)]">
          <PageBackground scoped />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
