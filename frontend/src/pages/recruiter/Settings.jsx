import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, CreditCard, UsersRound, Bell, MessageCircle, LogOut,
} from 'lucide-react';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import { useAuth } from '../../context/AuthContext';
import recruiterService from '../../services/recruiterService';

// Settings is an account hub: it surfaces the recruiter's account details and
// links to the pages that actually own each piece of configuration. It does not
// invent endpoints the backend doesn't expose.
const LINKS = [
  { label: 'Company profile', desc: 'Logo, name, and public company details.', to: '/recruiter/company',         icon: Building2 },
  { label: 'Plan & billing',  desc: 'Your subscription, invoices, and limits.', to: '/recruiter/billing/plan',    icon: CreditCard },
  { label: 'Team members',    desc: 'People who can manage your listings.',     to: '/recruiter/users',           icon: UsersRound },
  { label: 'Notifications',   desc: 'Application, bid, and pipeline alerts.',    to: '/recruiter/notifications',   icon: Bell },
  { label: 'Messages',        desc: 'Conversations with candidates.',           to: '/chat',                      icon: MessageCircle },
];

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-1 break-all">{value || '—'}</p>
    </div>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState(undefined);

  useEffect(() => {
    recruiterService.getProfile()
      .then(p => setCompany(p?.company ?? null))
      .catch(() => setCompany(null));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const roleLabel = (user?.roles ?? []).includes('recruiter') ? 'Recruiter' : (user?.roles?.[0] ?? '—');

  return (
    <RecruiterLayout title="Settings">
      <div className="space-y-6 max-w-3xl">

        {/* Account */}
        <div className="page-shell-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Account</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <Field label="Name"    value={fullName} />
            <Field label="Email"   value={user?.email} />
            <Field label="Role"    value={roleLabel} />
            <Field label="Company" value={company === undefined ? 'Loading…' : company?.name} />
          </div>
          <p className="text-xs text-gray-400 mt-4">
            To update your name or company details, edit your{' '}
            <Link to="/recruiter/company" className="text-blue-600 hover:underline">company profile</Link>.
          </p>
        </div>

        {/* Manage */}
        <div className="page-shell-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Manage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LINKS.map(({ label, desc, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-start gap-3 rounded-lg border border-blue-100/70 bg-white/40 px-4 py-3 hover:border-blue-300 hover:bg-white/70 transition-colors"
              >
                <span className="mt-0.5 text-blue-600 flex-shrink-0"><Icon size={18} /></span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-gray-900">{label}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Session */}
        <div className="page-shell-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Session</h2>
          <p className="text-xs text-gray-500 mb-4">Sign out of your account on this device.</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </div>
    </RecruiterLayout>
  );
}
