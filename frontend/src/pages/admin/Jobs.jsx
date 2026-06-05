import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../services/adminApi';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import SearchBar from '../../components/admin/SearchBar';
import Modal from '../../components/admin/Modal';

const LIMIT = 10;

const Jobs = () => {
  const [allJobs, setAllJobs]         = useState([]);
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal]     = useState(false);

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getJobs({ page: 1, limit: 1000 });
      setAllJobs(data.jobs);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => { setSearch(value); setPage(1); };
  const handleStatusChange = (e) => { setStatusFilter(e.target.value); setPage(1); };

  const filtered = useMemo(() => {
    let list = allJobs;
    if (statusFilter) list = list.filter(j => j.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(j =>
      [j.title, j.Company?.name, j.status, j.employmentType, j.workMode]
        .some(v => String(v ?? '').toLowerCase().includes(q))
    );
  }, [allJobs, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / LIMIT);
  const pageData   = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const handleRowClick = (job) => { setSelectedJob(job); setShowModal(true); };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await adminApi.deleteJob(selectedJob.id);
      setShowModal(false);
      loadJobs();
    } catch { alert('Failed to delete job'); }
  };

  const columns = [
    { key: 'id',    label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'Company', label: 'Company', render: (row) => row.Company?.name || 'N/A' },
    {
      key: 'status', label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.status === 'open'   ? 'bg-green-100 text-green-800' :
          row.status === 'closed' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'}`}>
          {row.status}
        </span>
      ),
    },
    { key: 'employmentType', label: 'Type' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Job Management</h2>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="flex-1">
          <SearchBar onSearch={handleSearch} placeholder="Search by title, company, type or status…" />
        </div>
        <select value={statusFilter} onChange={handleStatusChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <DataTable columns={columns} data={pageData} onRowClick={handleRowClick} loading={loading} />

      {!loading && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Job Details" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <p className="mt-1 text-sm text-gray-900">{selectedJob?.title}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <p className="mt-1 text-sm text-gray-900">{selectedJob?.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Employment Type</label>
              <p className="mt-1 text-sm text-gray-900">{selectedJob?.employmentType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1 text-sm text-gray-900">{selectedJob?.status}</p>
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete Job</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Jobs;
