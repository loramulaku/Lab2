import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import LeftPanel from './LeftPanel';

// ── Icons ─────────────────────────────────────────────────────────────────────
const CheckIcon = ({ className = 'w-4 h-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
  </svg>
);

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

// ── Stepper ───────────────────────────────────────────────────────────────────
function Stepper({ step }) {
  return (
    <div className="flex items-center mb-8">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {step > 1 ? <CheckIcon className="w-4 h-4 text-white" /> : '1'}
        </div>
        <span className="text-sm font-medium text-blue-600">Choose Role</span>
      </div>

      <div className={`flex-1 h-0.5 mx-3 ${step > 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />

      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 flex-shrink-0 ${
          step === 2 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-300'
        }`}>
          2
        </div>
        <span className={`text-sm font-medium ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          Create Account
        </span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const INPUT = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuthStore();

  const [step, setStep]             = useState(1);
  const [role, setRole]             = useState(null);   // 'candidate' | 'recruiter'
  const [showPw, setShowPw]         = useState(false);
  const [showCfm, setShowCfm]       = useState(false);
  const [confirmErr, setConfirmErr] = useState('');
  const [form, setForm]             = useState({ fullName: '', email: '', password: '', confirm: '' });

  const roleLabel = role === 'recruiter' ? 'Recruiter / Employer' : 'Job Seeker / Freelancer';

  const handleChange = (e) => {
    clearError();
    setConfirmErr('');
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const pickRole = (r) => { setRole(r); setStep(2); };

  const goBack = () => { setStep(1); clearError(); setConfirmErr(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setConfirmErr('Passwords do not match');
      return;
    }
    const parts     = form.fullName.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName  = parts.slice(1).join(' ') || '';
    try {
      await register({ firstName, lastName, email: form.email, password: form.password, role });
      navigate('/login');
    } catch {
      // error already set in store
    }
  };

  return (
    <div className="min-h-screen flex bg-[#2B3FE7]">
      <LeftPanel />

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 lg:p-10">
          <Stepper step={step} />

          {/* ── Step 1 — Choose Role ── */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">I am a...</h2>
              <p className="text-sm text-gray-500 mb-6">Choose your role to get started</p>

              <div className="flex flex-col gap-4">
                {/* Job Seeker */}
                <button
                  onClick={() => pickRole('candidate')}
                  className="flex items-center gap-4 rounded-2xl p-5 border-2 border-blue-600 bg-blue-600 text-left cursor-pointer transition-all duration-200 hover:bg-blue-700 hover:border-blue-700 w-full"
                >
                  <div className="bg-blue-500 rounded-xl p-2.5 flex-shrink-0 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Job Seeker / Freelancer</p>
                    <p className="text-sm text-blue-200 mt-0.5">Find jobs, bid on projects, track applications</p>
                  </div>
                </button>

                {/* Recruiter */}
                <button
                  onClick={() => pickRole('recruiter')}
                  className="flex items-center gap-4 rounded-2xl p-5 border-2 border-green-500 bg-green-50 text-left cursor-pointer transition-all duration-200 hover:bg-green-100 w-full"
                >
                  <div className="bg-green-100 rounded-xl p-2.5 flex-shrink-0 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5v-2h2v2zm4 4H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V5h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V5h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Recruiter / Employer</p>
                    <p className="text-sm text-green-600 mt-0.5">Post jobs, manage pipeline, hire top talent</p>
                  </div>
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
              </p>
            </>
          )}

          {/* ── Step 2 — Create Account ── */}
          {step === 2 && (
            <>
              <button onClick={goBack} className="text-blue-600 text-sm font-medium mb-4 hover:underline">
                ← Back
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
              <p className="text-sm text-gray-500 mb-6">
                Signing up as{' '}
                <span className="text-blue-600 font-semibold">{roleLabel}</span>
              </p>

              {error && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    name="fullName" type="text" placeholder="Your full name"
                    value={form.fullName} onChange={handleChange} required
                    className={INPUT}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    name="email" type="email" placeholder="you@example.com"
                    value={form.email} onChange={handleChange} required autoComplete="email"
                    className={INPUT}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      name="password" type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                      value={form.password} onChange={handleChange} required minLength={6} autoComplete="new-password"
                      className={INPUT}
                    />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      name="confirm" type={showCfm ? 'text' : 'password'} placeholder="Repeat password"
                      value={form.confirm} onChange={handleChange} required autoComplete="new-password"
                      className={`${INPUT} ${confirmErr ? 'border-red-400 focus:ring-red-300' : ''}`}
                    />
                    <button type="button" onClick={() => setShowCfm(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <EyeIcon open={showCfm} />
                    </button>
                  </div>
                  {confirmErr && <p className="text-xs text-red-500 mt-1">{confirmErr}</p>}
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-4 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-gray-400">
                By creating an account you agree to our{' '}
                <Link to="/terms" className="text-blue-600 hover:underline">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
