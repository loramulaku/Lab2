import { useState, useEffect } from 'react';
import exportService from '../../services/exportService';
import { AdminPage } from '../../components/layout';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';

const ENTITIES = [
  { key: 'users',        label: 'Users',        description: 'All registered users' },
  { key: 'jobs',         label: 'Jobs',         description: 'All job listings' },
  { key: 'applications', label: 'Applications', description: 'All job applications' },
  { key: 'companies',    label: 'Companies',    description: 'All registered companies' },
  { key: 'bids',         label: 'Bids',         description: 'All freelance bids' },
];

const FORMATS = [
  { key: 'csv',   label: 'CSV'   },
  { key: 'excel', label: 'Excel' },
  { key: 'json',  label: 'JSON'  },
];

export default function Reports() {
  const [loadingKey,     setLoadingKey]     = useState(null);
  const [history,        setHistory]        = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error,          setError]          = useState('');

  const loadHistory = () =>
    exportService.getMyExports()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setHistoryLoading(false));

  useEffect(() => { loadHistory(); }, []);

  const handleExport = async (entity, format) => {
    const key = `${entity}_${format}`;
    setLoadingKey(key);
    setError('');
    try {
      const { downloadUrl } = await exportService.triggerExport(entity, format);

      const a = document.createElement('a');
      a.href     = `${API_BASE}${downloadUrl}`;
      a.download = downloadUrl.split('/').pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? 'Export failed');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <AdminPage title="Reports & Exports" subtitle="Download platform data as CSV, Excel, or JSON files." error={error}>
      {/* ── Export cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {ENTITIES.map(entity => (
          <div key={entity.key} className="page-shell-card rounded-xl p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-1">{entity.label}</h3>
            <p className="text-xs text-gray-500 mb-4">{entity.description}</p>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map(fmt => {
                const key  = `${entity.key}_${fmt.key}`;
                const busy = loadingKey === key;
                return (
                  <button
                    key={fmt.key}
                    onClick={() => handleExport(entity.key, fmt.key)}
                    disabled={!!loadingKey}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                      busy
                        ? 'bg-blue-400 text-white cursor-wait'
                        : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {busy ? 'Exporting…' : `Export ${fmt.label}`}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Export history ─────────────────────────────────────────────────────── */}
      <div className="page-shell-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Export History</h3>
        </div>

        {historyLoading ? (
          <p className="px-5 py-10 text-sm text-gray-400 text-center">Loading…</p>
        ) : history.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-400 text-center">No exports yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Entity', 'Format', 'Date', 'Download'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map(exp => {
                  const parts  = (exp.type ?? '').split('_');
                  const entity = parts.slice(0, -1).join('_');
                  const fmt    = parts[parts.length - 1];
                  return (
                    <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 capitalize font-medium text-gray-800">{entity}</td>
                      <td className="px-6 py-4 uppercase text-gray-600">{fmt}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {exp.createdAt ? new Date(exp.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {exp.filePath ? (
                          <a
                            href={`${API_BASE}${exp.filePath}`}
                            download
                            className="text-blue-600 hover:text-blue-800 hover:underline text-xs font-medium"
                          >
                            Download
                          </a>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminPage>
  );
}
