import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemePreviewBridge from './components/admin/ThemePreviewBridge';
import { AdminShell } from './components/layout';

// ── Lazy-loaded route components ───────────────────────────────────────────────
// Each page is code-split into its own chunk and fetched on first navigation,
// so the initial bundle stays small. The shell/providers/guards above are eager
// because they are needed to render anything at all.
const Dashboard           = lazy(() => import('./pages/admin/Dashboard'));
const Users               = lazy(() => import('./pages/admin/Users'));
const Jobs                = lazy(() => import('./pages/admin/Jobs'));
const Companies           = lazy(() => import('./pages/admin/Companies'));
const Applications        = lazy(() => import('./pages/admin/Applications'));
const ThemeEditor         = lazy(() => import('./pages/admin/ThemeEditor'));
const Plans               = lazy(() => import('./pages/admin/Plans'));
const Categories          = lazy(() => import('./pages/admin/Categories'));
const JobDetail           = lazy(() => import('./pages/JobDetail'));
const Home                = lazy(() => import('./pages/Home'));
const Login               = lazy(() => import('./pages/auth/Login'));
const Register            = lazy(() => import('./pages/auth/Register'));
const MyProfile           = lazy(() => import('./pages/candidate/MyProfile'));
const PublicJobs          = lazy(() => import('./pages/Jobs'));
const CompanySetup        = lazy(() => import('./pages/recruiter/CompanySetup'));
const Overview            = lazy(() => import('./pages/recruiter/Overview'));
const MyJobs              = lazy(() => import('./pages/recruiter/MyJobs'));
const ArchivedJobs        = lazy(() => import('./pages/recruiter/ArchivedJobs'));
const JobSeekers          = lazy(() => import('./pages/recruiter/JobSeekers'));
const FreelanceApplicants = lazy(() => import('./pages/recruiter/FreelanceApplicants'));
const SearchInvite        = lazy(() => import('./pages/recruiter/SearchInvite'));
const FreelancerPicker    = lazy(() => import('./pages/recruiter/FreelancerPicker'));
const InvitedFreelancers  = lazy(() => import('./pages/recruiter/InvitedFreelancers'));
const BidsReceived        = lazy(() => import('./pages/recruiter/BidsReceived'));
const Contracts           = lazy(() => import('./pages/recruiter/Contracts'));
const CurrentPlan         = lazy(() => import('./pages/recruiter/billing/CurrentPlan'));
const BuyUpgrade          = lazy(() => import('./pages/recruiter/billing/BuyUpgrade'));
const Invoices            = lazy(() => import('./pages/recruiter/billing/Invoices'));
const TeamMembers         = lazy(() => import('./pages/recruiter/TeamMembers'));
const PaymentSuccess      = lazy(() => import('./pages/recruiter/PaymentSuccess'));
const PaymentCancelled    = lazy(() => import('./pages/recruiter/PaymentCancelled'));
const Chat                = lazy(() => import('./pages/chat/Chat'));
const ShowPipeline           = lazy(() => import('./pages/recruiter/pipeline/ShowPipeline'));
const TransitionNotes        = lazy(() => import('./pages/recruiter/pipeline/TransitionNotes'));
const CandidateInfo          = lazy(() => import('./pages/recruiter/pipeline/CandidateInfo'));
const RecruiterNotifications = lazy(() => import('./pages/recruiter/RecruiterNotifications'));
const Reports                = lazy(() => import('./pages/admin/Reports'));
const AuditLogs              = lazy(() => import('./pages/admin/AuditLogs'));


// ── Suspense fallback ──────────────────────────────────────────────────────────
// Shown while a lazily-loaded route chunk is being fetched.
function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
    </div>
  );
}

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
    <Suspense fallback={<PageFallback />}>
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
      {[
        ['/recruiter/dashboard',            <Overview />],
        ['/recruiter/jobs',                 <MyJobs />],
        ['/recruiter/jobs/archived',        <ArchivedJobs />],
        ['/recruiter/applicants/job-seekers', <JobSeekers />],
        ['/recruiter/applicants/freelance', <FreelanceApplicants />],
        ['/recruiter/freelancers/active',   <SearchInvite />],
        ['/recruiter/freelancers/pick',     <FreelancerPicker />],
        ['/recruiter/freelancers/invited',  <InvitedFreelancers />],
        ['/recruiter/bids',                 <BidsReceived />],
        ['/recruiter/contracts',            <Contracts />],
        ['/recruiter/billing/plan',         <CurrentPlan />],
        ['/recruiter/billing/upgrade',      <BuyUpgrade />],
        ['/recruiter/billing/invoices',     <Invoices />],
        ['/recruiter/users',                <TeamMembers />],
        ['/recruiter/company',              <CompanySetup />],
        ['/recruiter/payment/success',        <PaymentSuccess />],
        ['/recruiter/payment/cancelled',    <PaymentCancelled />],
        ['/recruiter/pipeline/board',       <ShowPipeline />],
        ['/recruiter/pipeline/notes',       <TransitionNotes />],
        ['/recruiter/pipeline/candidate/:applicationId', <CandidateInfo />],
        ['/recruiter/notifications',        <RecruiterNotifications />],
      ].map(([path, element]) => (
        <Route key={path} path={path} element={
          <ProtectedRoute roles={['recruiter']}>{element}</ProtectedRoute>
        } />
      ))}
      {/* Back-compat: pipeline create merged into board */}
      <Route path="/recruiter/pipeline/create" element={
        <ProtectedRoute roles={['recruiter']}><Navigate to="/recruiter/pipeline/board" replace /></ProtectedRoute>
      } />
      {/* Back-compat: old subscription link → current plan */}
      <Route path="/recruiter/subscription" element={
        <ProtectedRoute roles={['recruiter']}><Navigate to="/recruiter/billing/plan" replace /></ProtectedRoute>
      } />
      <Route path="/recruiter/*" element={
        <ProtectedRoute roles={['recruiter']}>
          <Navigate to="/recruiter/dashboard" replace />
        </ProtectedRoute>
      } />

      {/* Admin - Dashboard */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <AdminShell><Dashboard /></AdminShell>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['admin']}>
          <AdminShell><Users /></AdminShell>
        </ProtectedRoute>
      } />
      <Route path="/admin/jobs" element={
        <ProtectedRoute roles={['admin']}>
          <AdminShell><Jobs /></AdminShell>
        </ProtectedRoute>
      } />
      <Route path="/admin/companies" element={
        <ProtectedRoute roles={['admin']}>
          <AdminShell><Companies /></AdminShell>
        </ProtectedRoute>
      } />
      <Route path="/admin/applications" element={
        <ProtectedRoute roles={['admin']}>
          <AdminShell><Applications /></AdminShell>
        </ProtectedRoute>
      } />
      <Route path="/admin/theme" element={
        <ProtectedRoute roles={['admin']}>
          <AdminShell><ThemeEditor /></AdminShell>
        </ProtectedRoute>
      } />
      <Route path="/admin/plans" element={
        <ProtectedRoute roles={['admin']}>
          <AdminShell><Plans /></AdminShell>
        </ProtectedRoute>
      } />
      <Route path="/admin/categories" element={
        <ProtectedRoute roles={['admin']}>
          <AdminShell><Categories /></AdminShell>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute roles={['admin']}>
          <AdminShell><Reports /></AdminShell>
        </ProtectedRoute>
      } />
      <Route path="/admin/audit-logs" element={
        <ProtectedRoute roles={['admin']}>
          <AdminShell><AuditLogs /></AdminShell>
        </ProtectedRoute>
      } />

      {/* Chat */}
<Route path="/chat" element={
  <ProtectedRoute roles={['candidate', 'recruiter']}>
    <Chat />
  </ProtectedRoute>
} />

      {/* Job detail */}
      <Route path="/job/:id"       element={<JobDetail />} />

      {/* Public job board + header filters */}
      <Route path="/jobs"          element={<PublicJobs />} />
      <Route path="/jobs/:filter"  element={<PublicJobs />} />

      {/* Public home */}
      <Route path="/" element={<Home />} />

      {/* Default */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </Suspense>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ThemeProvider>
            {/* Activates click-to-select and highlight when running inside the ThemeEditor iframe */}
            <ThemePreviewBridge />
            <AppShell />
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
