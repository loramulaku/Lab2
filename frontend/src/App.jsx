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
import Plans from './pages/admin/Plans';
import Categories from './pages/admin/Categories';
import JobDetail from './pages/JobDetail';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MyProfile from './pages/candidate/MyProfile';
import PublicJobs from './pages/Jobs';
import CompanySetup from './pages/recruiter/CompanySetup';
import Overview from './pages/recruiter/Overview';
import MyJobs from './pages/recruiter/MyJobs';
import ArchivedJobs from './pages/recruiter/ArchivedJobs';
import JobSeekers from './pages/recruiter/JobSeekers';
import FreelanceApplicants from './pages/recruiter/FreelanceApplicants';
import SearchInvite from './pages/recruiter/SearchInvite';
import FreelancerPicker from './pages/recruiter/FreelancerPicker';
import InvitedFreelancers from './pages/recruiter/InvitedFreelancers';
import BidsReceived from './pages/recruiter/BidsReceived';
import Contracts from './pages/recruiter/Contracts';
import CurrentPlan from './pages/recruiter/billing/CurrentPlan';
import BuyUpgrade from './pages/recruiter/billing/BuyUpgrade';
import Invoices from './pages/recruiter/billing/Invoices';
import TeamMembers from './pages/recruiter/TeamMembers';
import PaymentSuccess from './pages/recruiter/PaymentSuccess';
import PaymentCancelled from './pages/recruiter/PaymentCancelled';
import Chat from './pages/chat/Chat';


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
        ['/recruiter/payment/success',      <PaymentSuccess />],
        ['/recruiter/payment/cancelled',    <PaymentCancelled />],
      ].map(([path, element]) => (
        <Route key={path} path={path} element={
          <ProtectedRoute roles={['recruiter']}>{element}</ProtectedRoute>
        } />
      ))}
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
      <Route path="/admin/plans" element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout><Plans /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/categories" element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout><Categories /></AdminLayout>
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
