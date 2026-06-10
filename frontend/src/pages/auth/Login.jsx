import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePageSection, useTheme } from '../../context/ThemeContext';
import { PageBackground } from '../../components/layout';
import LeftPanel from './LeftPanel';

const EyeIcon = ({ open }) => open ? (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
  </svg>
);

function LoginFormPanel({ sectionId = 'login-form' }) {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  const s = usePageSection('login', 'login-form');

  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => {
    clearError();
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form.email, form.password);
      const role = user.roles?.[0];
      if (role === 'admin')          navigate('/admin');
      else if (role === 'recruiter') navigate('/recruiter/dashboard');
      else                           navigate('/my-profile');
    } catch {
      // error already set in store
    }
  };

  const INPUT = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2';

  return (
    <div
      data-theme-section={sectionId}
      data-theme-label="Sign In Form"
      className="auth-form-panel w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative"
    >
      <div className="page-shell-card rounded-3xl w-full max-w-md p-8 lg:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="rounded-xl p-2" style={{ backgroundColor: s.btnBgColor ?? '#2563eb' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-10-2h4v2h-4V5z"/>
            </svg>
          </div>
          <span className="text-gray-900 font-bold text-xl">HireWire</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">{s.heading ?? 'Welcome back'}</h2>
        <p className="text-sm text-gray-500 mb-6">{s.subheading ?? 'Sign in to your account'}</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{s.emailLabel ?? 'Email Address'}</label>
            <input
              name="email" type="email" placeholder={s.emailPlaceholder ?? 'you@example.com'}
              value={form.email} onChange={handleChange} required autoComplete="email"
              className={INPUT}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{s.passwordLabel ?? 'Password'}</label>
            <div className="relative">
              <input
                name="password" type={showPw ? 'text' : 'password'} placeholder={s.passwordPlaceholder ?? 'Your password'}
                value={form.password} onChange={handleChange} required autoComplete="current-password"
                className={INPUT}
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <EyeIcon open={showPw} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-semibold rounded-xl py-4 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: s.btnBgColor ?? '#2563eb', color: s.btnTextColor ?? '#ffffff' }}
          >
            {loading ? 'Signing in…' : (s.btnText ?? 'Sign In')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {s.noAccountText ?? "Don't have an account?"}{' '}
          <Link to="/register" className="font-medium hover:underline" style={{ color: s.linkColor ?? '#2563eb' }}>
            {s.createOneText ?? 'Create one'}
          </Link>
        </p>
        <p className="mt-3 text-center">
          <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  const { config } = useTheme();
  const sections   = [...(config?.pages?.login?.sections ?? [])]
    .filter(s => s.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="auth-page-shell min-h-screen flex relative">
      <PageBackground />
      {sections.map((section) => {
        if (section.type === 'login-left') {
          return <LeftPanel key={section.id} sectionId={section.id} />;
        }
        if (section.type === 'login-form') {
          return <LoginFormPanel key={section.id} sectionId={section.id} />;
        }
        return null;
      })}
    </div>
  );
}
