import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import StatCard from '../../components/admin/StatCard';
import { AdminPage, PageCard } from '../../components/layout';

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    adminApi.getStats()
      .then((data) => { setStats(data); setError(null); })
      .catch(() => setError('Failed to load statistics'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPage title="Dashboard Overview" loading={loading} error={error}>
      <PageCard className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users"        value={stats?.users ?? 0}                    icon="👥" color="blue" />
          <StatCard title="Total Jobs"         value={stats?.jobs ?? 0}                     icon="💼" color="green" />
          <StatCard title="Total Companies"    value={stats?.companies ?? 0}                icon="🏢" color="purple" />
          <StatCard title="Total Applications" value={stats?.applications?.total ?? 0}      icon="📋" color="yellow" />
        </div>
      </PageCard>

      <PageCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Pending Applications"  value={stats?.applications?.pending ?? 0}  icon="⏳" color="yellow" />
          <StatCard title="Reviewed Applications" value={stats?.applications?.reviewed ?? 0} icon="👁️" color="blue" />
          <StatCard title="Accepted Applications" value={stats?.applications?.accepted ?? 0} icon="✅" color="green" />
          <StatCard title="Rejected Applications" value={stats?.applications?.rejected ?? 0} icon="❌" color="red" />
        </div>
      </PageCard>
    </AdminPage>
  );
}
