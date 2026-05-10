import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Jobs from './pages/admin/Jobs';
import Companies from './pages/admin/Companies';
import Applications from './pages/admin/Applications';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><Users /></AdminLayout>} />
        <Route path="/admin/jobs" element={<AdminLayout><Jobs /></AdminLayout>} />
        <Route path="/admin/companies" element={<AdminLayout><Companies /></AdminLayout>} />
        <Route path="/admin/applications" element={<AdminLayout><Applications /></AdminLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
