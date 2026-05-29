import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from './context/AuthContext';
import { tokenRef } from './services/api';
import { getTokenRoles, hasAnyRole } from './utils/auth';
import { SiteContentProvider } from './context/SiteContentContext';
import AdminLayout from './components/admin/AdminLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Users = lazy(() => import('./pages/admin/Users'));
const AdminJobs = lazy(() => import('./pages/admin/Jobs'));
const Companies = lazy(() => import('./pages/admin/Companies'));
const AdminApplications = lazy(() => import('./pages/admin/Applications'));
const SiteContent = lazy(() => import('./pages/admin/SiteContent'));
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const MyProfile = lazy(() => import('./pages/candidate/MyProfile'));
const CandidateDashboard = lazy(() => import('./pages/candidate/Dashboard'));
const MyApplications = lazy(() => import('./pages/candidate/MyApplications'));
const JobBrowse = lazy(() => import('./pages/candidate/JobBrowse'));
const JobDetail = lazy(() => import('./pages/candidate/JobDetail'));
const CompanySetup = lazy(() => import('./pages/recruiter/CompanySetup'));
const RecruiterDashboard = lazy(() => import('./pages/recruiter/Dashboard'));
const ApplicationBoard = lazy(() => import('./pages/recruiter/ApplicationBoard'));
const JobManagement = lazy(() => import('./pages/recruiter/JobManagement'));
const Messages = lazy(() => import('./pages/shared/Messages'));
const Notifications = lazy(() => import('./pages/shared/Notifications'));
const Settings = lazy(() => import('./pages/shared/Settings'));
const Terms = lazy(() => import('./pages/shared/Terms'));
const Privacy = lazy(() => import('./pages/shared/Privacy'));

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const tokenRoles = getTokenRoles(tokenRef.current);
  const effectiveRoles = tokenRoles.length ? tokenRoles : (user.roles ?? []);

  if (roles?.length && !hasAnyRole(effectiveRoles, roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function AppShell() {
  const { silentRefresh } = useAuth();
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;
    silentRefresh().finally(() => {
      if (!cancelled) setBootstrapping(false);
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <SiteContentProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
              403 — You are not authorized to view this page.
            </div>
          } />

          {/* Jobs — public browse & detail */}
          <Route path="/jobs/full-time" element={<JobBrowse defaultType="full-time" />} />
          <Route path="/jobs/part-time" element={<JobBrowse defaultType="part-time" />} />
          <Route path="/jobs/freelance" element={<JobBrowse defaultType="freelance" />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/jobs" element={<JobBrowse />} />

          {/* Candidate */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['candidate']}>
              <CandidateDashboard />
            </ProtectedRoute>
          } />
          <Route path="/my-profile" element={
            <ProtectedRoute roles={['candidate']}>
              <MyProfile />
            </ProtectedRoute>
          } />
          <Route path="/my-applications" element={
            <ProtectedRoute roles={['candidate']}>
              <MyApplications />
            </ProtectedRoute>
          } />

          {/* Shared — all authenticated roles */}
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          {/* Recruiter */}
          <Route path="/recruiter/dashboard" element={
            <ProtectedRoute roles={['recruiter']}>
              <RecruiterDashboard />
            </ProtectedRoute>
          } />
          <Route path="/recruiter/applications" element={
            <ProtectedRoute roles={['recruiter']}>
              <ApplicationBoard />
            </ProtectedRoute>
          } />
          <Route path="/recruiter/jobs/new" element={
            <ProtectedRoute roles={['recruiter']}>
              <Navigate to="/recruiter/jobs?new=1" replace />
            </ProtectedRoute>
          } />
          <Route path="/recruiter/jobs" element={
            <ProtectedRoute roles={['recruiter']}>
              <JobManagement />
            </ProtectedRoute>
          } />
          <Route path="/recruiter/company" element={
            <ProtectedRoute roles={['recruiter']}>
              <CompanySetup />
            </ProtectedRoute>
          } />
          <Route path="/recruiter/*" element={
            <ProtectedRoute roles={['recruiter']}>
              <Navigate to="/recruiter/dashboard" replace />
            </ProtectedRoute>
          } />

          {/* Theme editor — full-screen, outside admin chrome */}
          <Route path="/admin/content" element={
            <ProtectedRoute roles={['admin']}>
              <SiteContent />
            </ProtectedRoute>
          } />

          {/* Admin dashboard */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout><AdminDashboard /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout><Users /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/jobs" element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout><AdminJobs /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/companies" element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout><Companies /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/applications" element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout><AdminApplications /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute roles={['admin']}>
              <Navigate to="/admin" replace />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </SiteContentProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
