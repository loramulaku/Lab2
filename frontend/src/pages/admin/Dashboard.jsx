import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import StatCard from '../../components/admin/StatCard';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.users || 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Total Jobs"
          value={stats?.jobs || 0}
          icon="💼"
          color="green"
        />
        <StatCard
          title="Total Companies"
          value={stats?.companies || 0}
          icon="🏢"
          color="purple"
        />
        <StatCard
          title="Total Applications"
          value={stats?.applications?.total || 0}
          icon="📋"
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Applications"
          value={stats?.applications?.pending || 0}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="Reviewed Applications"
          value={stats?.applications?.reviewed || 0}
          icon="👁️"
          color="blue"
        />
        <StatCard
          title="Accepted Applications"
          value={stats?.applications?.accepted || 0}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Rejected Applications"
          value={stats?.applications?.rejected || 0}
          icon="❌"
          color="red"
        />
      </div>
    </div>
  );
};

export default Dashboard;
