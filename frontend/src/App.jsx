import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login        from './pages/auth/Login';
import Register     from './pages/auth/Register';
import MyProfile    from './pages/candidate/MyProfile';
import CompanySetup from './pages/recruiter/CompanySetup';

// ── Route guards ──────────────────────────────────────────────────────────────

/**
 * Renders children only when authenticated. While the silent-refresh is
 * running (bootstrapping = true) shows nothing to avoid a flash of /login.
 */
function ProtectedRoute({ children, roles }) {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  if (roles && user) {
    const hasRole = roles.some(r => user.roles?.includes(r));
    if (!hasRole) return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// ── App shell — handles silent refresh on mount ───────────────────────────────

function AppShell() {
  const { silentRefresh } = useAuth();
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    // Run exactly once on mount. silentRefresh has its own internal catch so
    // this .finally always fires — bootstrapping clears whether or not there
    // is a valid session.
    let cancelled = false;
    silentRefresh().finally(() => {
      if (!cancelled) setBootstrapping(false);
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — run once on mount only

  if (bootstrapping) return null; // blank while restoring session

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"        element={<Login />} />
      <Route path="/register"     element={<Register />} />
      <Route path="/unauthorized" element={
        <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
          403 — You are not authorized to view this page.
        </div>
      } />

      {/* Candidate */}
      <Route path="/my-profile" element={
        <ProtectedRoute roles={['candidate']}>
          <MyProfile />
        </ProtectedRoute>
      } />

      {/* Recruiter */}
      <Route path="/recruiter/company" element={
        <ProtectedRoute roles={['recruiter']}>
          <CompanySetup />
        </ProtectedRoute>
      } />
      <Route path="/recruiter/*" element={
        <ProtectedRoute roles={['recruiter']}>
          <Navigate to="/recruiter/company" replace />
        </ProtectedRoute>
      } />

      {/* Admin placeholder */}
      <Route path="/admin/*" element={
        <ProtectedRoute roles={['admin']}>
          <div className="p-8 text-gray-600">Admin dashboard (coming soon)</div>
        </ProtectedRoute>
      } />

      {/* Default */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
