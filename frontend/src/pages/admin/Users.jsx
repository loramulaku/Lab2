import { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import SearchBar from '../../components/admin/SearchBar';
import Modal from '../../components/admin/Modal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [formData, setFormData] = useState({});
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [pagination.page, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search,
      });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await adminApi.getRoles();
      setRoles(data);
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setFormData(user);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = () => {
    setModalMode('edit');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await adminApi.deleteUser(selectedUser.id);
      setShowModal(false);
      loadUsers();
    } catch (err) {
      alert('Failed to delete user');
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      await adminApi.updateUser(selectedUser.id, formData);
      setShowModal(false);
      loadUsers();
    } catch (err) {
      alert('Failed to update user');
      console.error(err);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
      </div>

      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search users by name or email..."
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        onRowClick={handleRowClick}
        loading={loading}
      />

      {!loading && users.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setPagination({ ...pagination, page })}
        />
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'view' ? 'User Details' : 'Edit User'}
      >
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">
                {selectedUser?.firstName} {selectedUser?.lastName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{selectedUser?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1 text-sm text-gray-900">
                {selectedUser?.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive || false}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setModalMode('view')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
