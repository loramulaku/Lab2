import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageBackground } from './shell';

const NavIcon = ({ path, path2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d={path} />
    {path2 && <path d={path2} />}
  </svg>
);

const ADMIN_NAV = [
  {
    name: 'Dashboard', href: '/admin',
    icon: <NavIcon path="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />,
  },
  {
    name: 'Users', href: '/admin/users',
    icon: <NavIcon path="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />,
  },
  {
    name: 'Jobs', href: '/admin/jobs',
    icon: <NavIcon path="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-10-2h4v2h-4V5z" />,
  },
  {
    name: 'Companies', href: '/admin/companies',
    icon: <NavIcon path="M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5v-2h2v2zm4 4H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V5h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V5h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2z" />,
  },
  {
    name: 'Applications', href: '/admin/applications',
    icon: <NavIcon path="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />,
  },
  {
    name: 'Plans', href: '/admin/plans',
    icon: <NavIcon path="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />,
  },
  {
    name: 'Categories', href: '/admin/categories',
    icon: <NavIcon path="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />,
  },
  {
    name: 'Reports', href: '/admin/reports',
    icon: <NavIcon path="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" />,
  },
  {
    name: 'Audit Logs', href: '/admin/audit-logs',
    icon: <NavIcon path="M13 2.05V4.08c3.39.49 6 3.39 6 6.92 0 3.21-1.88 6-4.72 7.28L13 17v5h5l-1.22-1.22C19.91 19.07 22 15.76 22 12c0-5.18-3.95-9.45-9-9.95zM11 2.05C5.95 2.55 2 6.82 2 12c0 3.76 2.09 7.07 5.22 8.78L6 22h5V2.05zM12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />,
  },
  {
    name: 'Theme Editor', href: '/admin/theme',
    icon: <NavIcon path="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />,
  },
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
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white" aria-label="Close sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="mt-6 px-3">
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
              isNavActive(pathname, item.href) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {item.icon}
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
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
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
