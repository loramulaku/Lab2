import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import DataTable from '../../components/admin/DataTable';
import SearchBar from '../../components/admin/SearchBar';
import Modal from '../../components/admin/Modal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

export default function Categories() {
  const [all,       setAll]       = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [deleting,  setDeleting]  = useState(null);
  const [name,      setName]      = useState('');
  const [formError, setFormError] = useState('');
  const [saving,    setSaving]    = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { setAll(await adminApi.getCategories()); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? all.filter(c => c.name.toLowerCase().includes(q)) : all;
  }, [all, search]);

  const openCreate = () => { setEditing(null); setName(''); setFormError(''); setShowForm(true); };
  const openEdit   = (c)  => { setEditing(c); setName(c.name); setFormError(''); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setFormError('Name is required'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editing) await adminApi.updateCategory(editing.id, { name: name.trim() });
      else         await adminApi.createCategory({ name: name.trim() });
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try { await adminApi.deleteCategory(deleting.id); setDeleting(null); load(); }
    catch { alert('Failed to delete category'); }
  };

  const columns = [
    { key: 'id',   label: 'ID' },
    { key: 'name', label: 'Name' },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => openEdit(row)} className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700">Edit</button>
          <button onClick={() => setDeleting(row)} className="px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Job Categories</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">+ Add Category</button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Categories are created here by admins. Recruiters pick from this list when posting a job. Job seekers filter by category tabs on the listings page.
      </p>

      <div className="mb-6">
        <SearchBar onSearch={setSearch} placeholder="Search categories…" />
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title={editing ? 'Edit Category' : 'Add Category'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Engineering, Design, Data…"
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </Modal>

      {deleting && (
        <ConfirmDeleteModal
          message={`Delete category "${deleting.name}"? Jobs that used this category will lose it.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
