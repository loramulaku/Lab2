import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemePreviewBridge from './components/admin/ThemePreviewBridge';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Jobs from './pages/admin/Jobs';
import Companies from './pages/admin/Companies';
import Applications from './pages/admin/Applications';
import ThemeEditor from './pages/admin/ThemeEditor';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MyProfile from './pages/candidate/MyProfile';
import CompanySetup from './pages/recruiter/CompanySetup';

// ── Route guards ──────────────────────────────────────────────────────────────

/**
 * Renders children only when authenticated. While the silent-refresh is
 * running (bootstrapping = true) shows nothing to avoid a flash of /login.
 */
function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

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

      {/* Admin - Dashboard */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout><Dashboard /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout><Users /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/jobs" element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout><Jobs /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/companies" element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout><Companies /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/applications" element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout><Applications /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/theme" element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout><ThemeEditor /></AdminLayout>
        </ProtectedRoute>
      } />

      {/* Public home */}
      <Route path="/" element={<Home />} />

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
        <ThemeProvider>
          {/* Activates click-to-select and highlight when running inside the ThemeEditor iframe */}
          <ThemePreviewBridge />
          <AppShell />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
