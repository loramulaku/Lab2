import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Recruiter dashboard shell — full sidebar navigation (FEATURE 2).
 * Grouped, professionally-named sections matching the product spec.
 */
const NAV_GROUPS = [
  {
    title: null,
    items: [{ name: 'Overview', href: '/recruiter/dashboard' }],
  },
  {
    title: 'Job Management',
    items: [
      { name: 'Post a Job',      href: '/recruiter/jobs?post=1', match: '/recruiter/jobs' },
      { name: 'My Job Listings', href: '/recruiter/jobs' },
      { name: 'Archived Jobs',   href: '/recruiter/jobs/archived' },
    ],
  },
  {
    title: 'Applicants & Candidates',
    items: [
      { name: 'Job Seekers',          href: '/recruiter/applicants/job-seekers' },
      { name: 'Freelance Applicants', href: '/recruiter/applicants/freelance' },
    ],
  },
  {
    title: 'Freelance Management',
    items: [
      { name: 'Active Freelancers',  href: '/recruiter/freelancers/active' },
      { name: 'Invited Freelancers', href: '/recruiter/freelancers/invited' },
      { name: 'Bids Received',       href: '/recruiter/bids' },
      { name: 'Contracts',           href: '/recruiter/contracts' },
    ],
  },
  {
    title: 'Billing & Payments',
    items: [
      { name: 'My Current Plan',            href: '/recruiter/billing/plan' },
      { name: 'Buy / Upgrade Plan',         href: '/recruiter/billing/upgrade' },
      { name: 'Invoices & Billing History', href: '/recruiter/billing/invoices' },
    ],
  },
  {
    title: 'User Management',
    items: [{ name: 'Team Members', href: '/recruiter/users' }],
  },
];

export default function RecruiterLayout({ children, title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (item) => {
    const base = item.match ?? item.href.split('?')[0];
    if (base === '/recruiter/jobs') return location.pathname === '/recruiter/jobs';
    return location.pathname === base || location.pathname.startsWith(base + '/');
  };

  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 overflow-y-auto">
        <div className="flex items-center h-16 px-6 bg-gray-800 sticky top-0">
          <span className="text-xl font-bold text-white">HireWire</span>
          <span className="ml-2 text-xs text-blue-300 font-medium">Recruiter</span>
        </div>

        <nav className="mt-4 px-3 pb-24">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className="mb-4">
              {group.title && (
                <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{group.title}</p>
              )}
              {group.items.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 mb-1 rounded-lg text-sm transition-colors ${
                    isActive(item)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="pl-64">
        <div className="sticky top-0 z-40 flex h-16 bg-white shadow items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-800">{title ?? 'Recruiter Dashboard'}</h1>
          <div className="flex items-center gap-4">
            <Link to="/recruiter/company" className="text-sm text-gray-600 hover:text-gray-900">Company Profile</Link>
            <span className="text-sm text-gray-500">{user?.firstName ?? 'Recruiter'}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700">Logout</button>
          </div>
        </div>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
