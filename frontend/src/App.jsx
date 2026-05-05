import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import JobList        from './pages/jobs/JobList';
import JobDetail      from './pages/jobs/JobDetail';
import CreateJob      from './pages/jobs/CreateJob';
import MyApplications from './pages/applications/MyApplications';
import MyBids         from './pages/bids/MyBids';
import MyInvitations  from './pages/invitations/MyInvitations';

function Navbar() {
  const { isLoggedIn, isRecruiter, user } = useAuth();
  const { pathname } = useLocation();

  const navLink = (to, label) => (
    <Link to={to} style={{
      ...s.link,
      color: pathname === to ? '#fff' : 'rgba(255,255,255,0.75)',
      borderBottom: pathname === to ? '2px solid #fff' : '2px solid transparent',
      paddingBottom: '2px',
    }}>{label}</Link>
  );

  return (
    <nav style={s.bar}>
      {/* Logo */}
      <Link to="/jobs" style={s.brand}>
        <span style={s.logoBox}>💼</span>
        <span style={s.logoText}>HireFlow</span>
      </Link>

      {/* Centre links */}
      <div style={s.centreLinks}>
        {navLink('/jobs', 'Find Jobs')}
        {navLink('/freelance', 'Freelance')}
        {navLink('/companies', 'Companies')}
      </div>

      {/* Right side */}
      <div style={s.right}>
        <button style={s.iconBtn} title="Search">
          <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </button>
        <button style={s.iconBtn} title="Notifications">
          <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span style={s.badge}>2</span>
        </button>
        <button style={s.iconBtn} title="Messages">
          <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
        <button style={s.iconBtn} title="Dashboard">
          <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        </button>

        {isLoggedIn ? (
          <div style={s.userChip}>
            <div style={s.avatar}>{user?.email?.[0]?.toUpperCase() ?? 'U'}</div>
            <span style={s.userName}>{user?.email?.split('@')[0] ?? 'User'}</span>
            <span style={s.roleBadge}>{isRecruiter ? 'Recruiter' : 'Candidate'}</span>
          </div>
        ) : (
          <Link to="/login" style={s.loginBtn}>Log in</Link>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"                element={<Navigate to="/jobs" replace />} />
        <Route path="/jobs"            element={<JobList />} />
        <Route path="/jobs/new"        element={<CreateJob />} />
        <Route path="/jobs/:id"        element={<JobDetail />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/my-bids"         element={<MyBids />} />
        <Route path="/invitations"     element={<MyInvitations />} />
      </Routes>
    </>
  );
}

const s = {
  bar:        { display: 'flex', alignItems: 'center', gap: '2rem', padding: '0 1.75rem', height: 64, background: '#2B3A8C', position: 'sticky', top: 0, zIndex: 50 },
  brand:      { display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 },
  logoBox:    { width: 32, height: 32, background: '#3D50C8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' },
  logoText:   { color: '#fff', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' },
  centreLinks:{ display: 'flex', gap: '1.75rem', flex: 1 },
  link:       { fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s' },
  right:      { display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' },
  iconBtn:    { position: 'relative', background: 'transparent', border: 'none', padding: '0.5rem', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  badge:      { position: 'absolute', top: 4, right: 4, background: '#EF4444', color: '#fff', fontSize: '0.6rem', fontWeight: 700, width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userChip:   { display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem', cursor: 'pointer' },
  avatar:     { width: 32, height: 32, borderRadius: '50%', background: '#6C8AE4', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' },
  userName:   { color: '#fff', fontSize: '0.875rem', fontWeight: 500 },
  roleBadge:  { background: '#3B82F6', color: '#fff', fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999 },
  loginBtn:   { marginLeft: '0.75rem', padding: '0.45rem 1rem', background: '#fff', color: '#2B3A8C', borderRadius: 999, fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' },
};
