import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../BrandLogo';

const NAV = [
  { name: 'Dashboard',    href: '/admin',              icon: '📊' },
  { name: 'Users',        href: '/admin/users',        icon: '👥' },
  { name: 'Jobs',         href: '/admin/jobs',         icon: '💼' },
  { name: 'Companies',    href: '/admin/companies',    icon: '🏢' },
  { name: 'Applications', href: '/admin/applications', icon: '📋' },
  { name: 'Theme Editor', href: '/admin/content',      icon: '🎨' },
];

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (href) =>
    href === '/admin' ? location.pathname === href : location.pathname.startsWith(href);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Administrator';
  const initials = (user?.firstName?.[0] ?? 'A') + (user?.lastName?.[0] ?? 'D');

  return (
    <div className="min-h-screen bg-gray-100">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <BrandLogo variant="footer" to="/admin" />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="mt-6 px-3">
          {NAV.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              end={item.href === '/admin'}
              className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-all duration-150 ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <Link
            to="/"
            className="flex items-center px-4 py-2 text-gray-300 hover:text-white transition-colors duration-150"
          >
            <span className="mr-3">←</span>
            <span>Back to site</span>
          </Link>
        </div>
      </aside>

      <div className={sidebarOpen ? 'lg:pl-64' : ''}>
        <header className="sticky top-0 z-40 flex h-16 bg-white shadow">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className={`px-4 text-gray-500 focus:outline-none lg:hidden ${sidebarOpen ? 'hidden' : ''}`}
            aria-label="Open sidebar"
          >
            <span className="text-2xl">☰</span>
          </button>

          <div className="flex-1 flex justify-between items-center px-8">
            <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold uppercase">
                  {initials}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-gray-800">{fullName}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 transition-colors duration-150"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main key={location.pathname} className="p-8 animate-page-enter">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
