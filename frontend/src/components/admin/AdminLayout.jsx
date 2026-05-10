import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Jobs', href: '/admin/jobs', icon: '💼' },
    { name: 'Companies', href: '/admin/companies', icon: '🏢' },
    { name: 'Applications', href: '/admin/applications', icon: '📋' },
  ];

  const isActive = (href) => {
    if (href === '/admin') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <span className="text-xl font-bold text-white">HireFlow Admin</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
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
            className="flex items-center px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            <span className="mr-3">←</span>
            <span>Back to Site</span>
          </Link>
        </div>
      </div>

      <div className={`${sidebarOpen ? 'lg:pl-64' : ''}`}>
        <div className="sticky top-0 z-40 flex h-16 bg-white shadow">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`px-4 text-gray-500 focus:outline-none lg:hidden ${sidebarOpen ? 'hidden' : ''}`}
          >
            <span className="text-2xl">☰</span>
          </button>

          <div className="flex-1 flex justify-between items-center px-8">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Administrator</span>
              <button className="text-sm text-red-600 hover:text-red-700">Logout</button>
            </div>
          </div>
        </div>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
