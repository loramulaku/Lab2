import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login     from './pages/auth/Login';
import Register  from './pages/auth/Register';
import MyProfile from './pages/freelancer/MyProfile';
import useAuthStore from './store/authStore';

function PrivateRoute({ children, roles }) {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && user && !roles.some(r => user.roles?.includes(r))) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Additional module routes will be registered here as each module is built.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Candidate */}
        <Route
          path="/my-profile"
          element={
            <PrivateRoute roles={['candidate']}>
              <MyProfile />
            </PrivateRoute>
          }
        />

        {/* Protected placeholders */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute roles={['admin']}>
              <div className="p-8 text-gray-600">Admin dashboard (coming soon)</div>
            </PrivateRoute>
          }
        />
        <Route
          path="/client/*"
          element={
            <PrivateRoute roles={['recruiter']}>
              <div className="p-8 text-gray-600">Recruiter dashboard (coming soon)</div>
            </PrivateRoute>
          }
        />

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
