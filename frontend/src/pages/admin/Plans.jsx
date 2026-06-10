import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../services/adminApi';
import DataTable from '../../components/admin/DataTable';
import SearchBar from '../../components/admin/SearchBar';
import Modal from '../../components/admin/Modal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { AdminPage } from '../../components/layout';

const Plans = () => {
  const [allPlans, setAllPlans]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [formData, setFormData]       = useState({ name: '', price: '', jobLimit: '' });
  const [formError, setFormError]     = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setAllPlans(await adminApi.getPlans());
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allPlans;
    return allPlans.filter(p =>
      [p.name, String(p.price), p.jobLimit == null ? 'unlimited' : String(p.jobLimit), p.isActive ? 'active' : 'inactive']
        .some(v => v.toLowerCase().includes(q))
    );
  }, [allPlans, search]);

  const openCreate = () => {
    setEditingPlan(null);
    setFormData({ name: '', price: '', jobLimit: '' });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({ name: plan.name, price: String(plan.price), jobLimit: plan.jobLimit != null ? String(plan.jobLimit) : '' });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.price) { setFormError('Name and price are required'); return; }
    const payload = {
      name:     formData.name,
      price:    parseFloat(formData.price),
      jobLimit: formData.jobLimit !== '' ? parseInt(formData.jobLimit, 10) : null,
    };
    try {
      setSubmitting(true);
      if (editingPlan) await adminApi.updatePlan(editingPlan.id, payload);
      else             await adminApi.createPlan(payload);
      setShowForm(false);
      loadPlans();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try { await adminApi.deletePlan(deletingPlan.id); setDeletingPlan(null); loadPlans(); }
    catch { setDeletingPlan(null); setDeleteError('Failed to deactivate plan'); }
  };

  const columns = [
    { key: 'id',   label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'price',    label: 'Price/mo',  render: (row) => `$${Number(row.price).toFixed(2)}` },
    { key: 'jobLimit', label: 'Job Limit', render: (row) => row.jobLimit == null ? 'Unlimited' : row.jobLimit },
    {
      key: 'isActive', label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-medium rounded ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => openEdit(row)} className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit</button>
          {row.isActive && (
            <button onClick={() => setDeletingPlan(row)} className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700">Deactivate</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminPage title="Subscription Plans" error={deleteError}>
      <div className="flex justify-end mb-6">
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Add Plan</button>
      </div>

      <div className="mb-6">
        <SearchBar onSearch={setSearch} placeholder="Search by name, price, job limit or status…" />
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title={editingPlan ? 'Edit Plan' : 'Create New Plan'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
            <input type="text" value={formData.name} placeholder="e.g. Basic, Pro"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Month (USD)</label>
            <input type="number" min="0" step="0.01" value={formData.price} placeholder="e.g. 19.99"
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Limit <span className="text-gray-400 font-normal">(leave empty for unlimited)</span>
            </label>
            <input type="number" min="1" value={formData.jobLimit} placeholder="e.g. 5"
              onChange={(e) => setFormData({ ...formData, jobLimit: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </Modal>

      {deletingPlan && (
        <ConfirmDeleteModal
          message={`Deactivate the "${deletingPlan.name}" plan? Existing subscribers keep access until their period ends.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingPlan(null)}
        />
      )}
    </AdminPage>
  );
};

export default Plans;
