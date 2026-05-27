import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import SiteLayout from '../../components/SiteLayout';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 py-4 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-brand-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </label>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState({
    emailApplications: true,
    emailMessages: true,
    pushApplications: true,
    pushMessages: false,
  });

  const setPref = (key) => (value) => setPrefs((p) => ({ ...p, [key]: value }));

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <SiteLayout>
      <div className="max-w-xl mx-auto">
        <PageHeader
          title="Settings"
          subtitle="Manage your account and notification preferences."
          className="mb-8"
        />

        <section className="surface p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Account</h2>
              <p className="text-xs text-gray-500">Your sign-in details</p>
            </div>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 py-2 border-b border-gray-100">
              <dt className="text-gray-500">Name</dt>
              <dd className="text-gray-900 font-medium text-right">
                {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900 font-medium text-right truncate">{user?.email ?? '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="surface p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <BellIcon className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
              <p className="text-xs text-gray-500">Choose what we email you about</p>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            <Toggle
              label="Application updates"
              description="Status changes on jobs you applied to or posted"
              checked={prefs.emailApplications}
              onChange={setPref('emailApplications')}
            />
            <Toggle
              label="New messages"
              description="When someone sends you a direct message"
              checked={prefs.emailMessages}
              onChange={setPref('emailMessages')}
            />
          </div>
        </section>

        <section className="surface p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <EnvelopeIcon className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">In-app alerts</h2>
              <p className="text-xs text-gray-500">Badges on the bell and messages icons</p>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            <Toggle
              label="Application alerts"
              checked={prefs.pushApplications}
              onChange={setPref('pushApplications')}
            />
            <Toggle
              label="Message alerts"
              checked={prefs.pushMessages}
              onChange={setPref('pushMessages')}
            />
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Preferences are saved locally until account settings sync is available.
          </p>
        </section>

        <button type="button" onClick={handleSignOut} className="btn-secondary w-full text-red-600 border-red-200 hover:bg-red-50">
          Sign out of HireFlow
        </button>
      </div>
    </SiteLayout>
  );
}
