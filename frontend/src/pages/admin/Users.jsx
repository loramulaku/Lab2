import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../services/adminApi';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import SearchBar from '../../components/admin/SearchBar';
import Modal from '../../components/admin/Modal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { AdminPage } from '../../components/layout';

const LIMIT = 10;

const Users = () => {
  const [allUsers, setAllUsers]     = useState([]);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [modalMode, setModalMode]   = useState('view');
  const [formData, setFormData]     = useState({});
  const [roles, setRoles]           = useState([]);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteError, setDeleteError]   = useState('');
  const [saveError, setSaveError]       = useState('');

  useEffect(() => { loadUsers(); loadRoles(); }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers({ page: 1, limit: 1000 });
      setAllUsers(data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try { setRoles(await adminApi.getRoles()); }
    catch (err) { console.error('Failed to load roles:', err); }
  };

  const handleSearch = (value) => { setSearch(value); setPage(1); };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter(u =>
      [u.firstName, u.lastName, u.email, u.isActive ? 'active' : 'inactive']
        .some(v => String(v ?? '').toLowerCase().includes(q))
    );
  }, [allUsers, search]);

  const totalPages = Math.ceil(filtered.length / LIMIT);
  const pageData   = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const handleRowClick = (user) => {
    setSelectedUser(user); setFormData(user); setModalMode('view'); setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteUser(deletingUser.id);
      setDeletingUser(null);
      loadUsers();
    } catch { setDeletingUser(null); setDeleteError('Failed to delete user'); }
  };

  const handleSave = async () => {
    setSaveError('');
    try {
      await adminApi.updateUser(selectedUser.id, formData);
      setShowModal(false);
      loadUsers();
    } catch { setSaveError('Failed to update user'); }
  };

  const columns = [
    { key: 'id',        label: 'ID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName',  label: 'Last Name' },
    { key: 'email',     label: 'Email' },
    {
      key: 'isActive', label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <AdminPage title="User Management" error={deleteError}>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Search by name, email or status…" />
      </div>

      <DataTable columns={columns} data={pageData} onRowClick={handleRowClick} loading={loading} />

      {!loading && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={modalMode === 'view' ? 'User Details' : 'Edit User'}>
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{selectedUser?.firstName} {selectedUser?.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{selectedUser?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1 text-sm text-gray-900">{selectedUser?.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="flex space-x-3 pt-4">
              <button onClick={() => setModalMode('edit')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit</button>
              <button onClick={() => { setShowModal(false); setDeletingUser(selectedUser); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" value={formData.firstName || ''} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" value={formData.lastName || ''} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" checked={formData.isActive || false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            <div className="flex space-x-3 pt-4">
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
              <button onClick={() => { setSaveError(''); setModalMode('view'); }} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
      {deletingUser && (
        <ConfirmDeleteModal
          message={`Delete user "${deletingUser.firstName} ${deletingUser.lastName}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </AdminPage>
  );
};

export default Users;
