import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadApplications();
  }, [pagination.page, statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getApplications({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
      });
      setApplications(data.applications);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'Job',
      label: 'Job',
      render: (row) => row.Job?.title || 'N/A',
    },
    {
      key: 'Candidate',
      label: 'Candidate',
      render: (row) => row.Candidate ? `${row.Candidate.firstName} ${row.Candidate.lastName}` : 'N/A',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          row.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
          row.status === 'accepted' ? 'bg-green-100 text-green-800' :
          row.status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Applied At',
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Application Monitoring</h2>
      </div>

      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={applications}
        loading={loading}
      />

      {!loading && applications.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setPagination({ ...pagination, page })}
        />
      )}
    </div>
  );
};

export default Applications;
