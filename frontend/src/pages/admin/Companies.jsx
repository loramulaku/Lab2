import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../services/adminApi';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import SearchBar from '../../components/admin/SearchBar';
import Modal from '../../components/admin/Modal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { AdminPage } from '../../components/layout';

const LIMIT = 10;

const Companies = () => {
  const [allCompanies, setAllCompanies] = useState([]);
  const [page, setPage]                 = useState(1);
  const [loading, setLoading]           = useState(false);
  const [search, setSearch]             = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal]       = useState(false);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [deleteError, setDeleteError]   = useState('');

  useEffect(() => { loadCompanies(); }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCompanies({ page: 1, limit: 1000 });
      setAllCompanies(data.companies);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => { setSearch(value); setPage(1); };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allCompanies;
    return allCompanies.filter(c =>
      [c.name, c.industry, c.size, c.location, c.description]
        .some(v => String(v ?? '').toLowerCase().includes(q))
    );
  }, [allCompanies, search]);

  const totalPages = Math.ceil(filtered.length / LIMIT);
  const pageData   = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const handleRowClick = (company) => { setSelectedCompany(company); setShowModal(true); };

  const handleDelete = async () => {
    try {
      await adminApi.deleteCompany(deletingCompany.id);
      setDeletingCompany(null);
      loadCompanies();
    } catch { setDeletingCompany(null); setDeleteError('Failed to delete company'); }
  };

  const columns = [
    { key: 'id',       label: 'ID' },
    { key: 'name',     label: 'Name' },
    { key: 'industry', label: 'Industry' },
    { key: 'size',     label: 'Size' },
    { key: 'location', label: 'Location' },
  ];

  return (
    <AdminPage title="Company Management" error={deleteError}>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Search by name, industry, size or location…" />
      </div>

      <DataTable columns={columns} data={pageData} onRowClick={handleRowClick} loading={loading} />

      {!loading && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Company Details">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-sm text-gray-900">{selectedCompany?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <p className="mt-1 text-sm text-gray-900">{selectedCompany?.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <p className="mt-1 text-sm text-gray-900">{selectedCompany?.industry}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Size</label>
              <p className="mt-1 text-sm text-gray-900">{selectedCompany?.size}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <p className="mt-1 text-sm text-gray-900">{selectedCompany?.location}</p>
          </div>
          <div className="flex space-x-3 pt-4">
            <button onClick={() => { setShowModal(false); setDeletingCompany(selectedCompany); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete Company</button>
          </div>
        </div>
      </Modal>
      {deletingCompany && (
        <ConfirmDeleteModal
          message={`Delete company "${deletingCompany.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingCompany(null)}
        />
      )}
    </AdminPage>
  );
};

export default Companies;
