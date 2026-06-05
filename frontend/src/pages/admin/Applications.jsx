import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../services/adminApi';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import SearchBar from '../../components/admin/SearchBar';

const LIMIT = 10;

const Applications = () => {
  const [allApplications, setAllApplications] = useState([]);
  const [page, setPage]                       = useState(1);
  const [loading, setLoading]                 = useState(false);
  const [search, setSearch]                   = useState('');
  const [statusFilter, setStatusFilter]       = useState('');

  useEffect(() => { loadApplications(); }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getApplications({ page: 1, limit: 1000 });
      setAllApplications(data.applications);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => { setSearch(value); setPage(1); };
  const handleStatusChange = (e) => { setStatusFilter(e.target.value); setPage(1); };

  const filtered = useMemo(() => {
    let list = allApplications;
    if (statusFilter) list = list.filter(a => a.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(a => {
      const candidateName = a.Candidate
        ? `${a.Candidate.firstName} ${a.Candidate.lastName}`
        : '';
      return [a.Job?.title, candidateName, a.status]
        .some(v => String(v ?? '').toLowerCase().includes(q));
    });
  }, [allApplications, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / LIMIT);
  const pageData   = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'Job',       label: 'Job',       render: (row) => row.Job?.title || 'N/A' },
    { key: 'Candidate', label: 'Candidate', render: (row) => row.Candidate ? `${row.Candidate.firstName} ${row.Candidate.lastName}` : 'N/A' },
    {
      key: 'status', label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.status === 'pending'  ? 'bg-yellow-100 text-yellow-800' :
          row.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
          row.status === 'accepted' ? 'bg-green-100 text-green-800' :
          row.status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'}`}>
          {row.status}
        </span>
      ),
    },
    { key: 'created_at', label: 'Applied At', render: (row) => new Date(row.created_at).toLocaleDateString() },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Application Monitoring</h2>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="flex-1">
          <SearchBar onSearch={handleSearch} placeholder="Search by job title, candidate name or status…" />
        </div>
        <select value={statusFilter} onChange={handleStatusChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <DataTable columns={columns} data={pageData} loading={loading} />

      {!loading && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
};

export default Applications;
