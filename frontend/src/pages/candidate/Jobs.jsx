import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/Header';

const BTN_PRIMARY = 'bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 text-sm transition rounded-none';
const BTN_OUTLINE = 'border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 text-sm transition rounded-none';

const WORK_MODES        = ['', 'remote', 'onsite', 'hybrid'];
const EMPLOYMENT_TYPES  = ['', 'full-time', 'part-time', 'contract', 'freelance'];

export default function Jobs() {
  const navigate = useNavigate();

  const [jobs, setJobs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [messaging, setMessaging]   = useState(null);
  const [msgError, setMsgError]     = useState('');

  const [filters, setFilters] = useState({
    status: 'active',
    workMode: '',
    employmentType: '',
    skill: '',
  });

  const [search, setSearch] = useState('');

  const limit = 10;

  useEffect(() => {
    loadJobs();
  }, [filters, page]);

  async function loadJobs() {
    setLoading(true);
    try {
      const params = { page, limit, ...filters };
      // Remove empty filters
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const res = await api.get('/jobs', { params });
      setJobs(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function setFilter(key, value) {
    setPage(1);
    setFilters(f => ({ ...f, [key]: value }));
  }

  async function handleMessageRecruiter(job) {
    if (!job.recruiterId) return;
    setMessaging(job.id);
    try {
      await api.post('/conversations', { recipientId: job.recruiterId });
      navigate('/chat');
    } catch (err) {
      console.error(err);
      setMsgError('Could not start conversation. Try again.');
    } finally {
      setMessaging(null);
    }
  }

  const filtered = search.trim()
    ? jobs.filter(j =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.company?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : jobs;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto pt-24 pb-8 px-4">

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Find Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">{total} jobs available</p>
        </div>

        {/* Search + filters */}
        <div className="bg-white border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or company..."
            className="flex-1 min-w-[200px] border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-none"
          />
          <select
            value={filters.workMode}
            onChange={e => setFilter('workMode', e.target.value)}
            className="border border-gray-200 px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All work modes</option>
            {WORK_MODES.filter(Boolean).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={filters.employmentType}
            onChange={e => setFilter('employmentType', e.target.value)}
            className="border border-gray-200 px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All types</option>
            {EMPLOYMENT_TYPES.filter(Boolean).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            onClick={() => { setFilters({ status: 'active', workMode: '', employmentType: '', skill: '' }); setSearch(''); setPage(1); }}
            className={BTN_OUTLINE}
          >
            Clear
          </button>
        </div>

        {msgError && <p className="text-sm text-red-600 mb-3">{msgError}</p>}

        {/* Job list */}
        {loading && <p className="text-gray-400 text-sm py-8 text-center">Loading…</p>}

        {!loading && filtered.length === 0 && (
          <p className="text-gray-400 text-sm py-8 text-center">No jobs found.</p>
        )}

        <div className="space-y-3">
          {filtered.map(job => (
            <div key={job.id} className="bg-white border border-gray-200 p-5 hover:border-gray-300 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 text-base">{job.title}</h2>
                  {job.company?.name && (
                    <p className="text-blue-600 text-sm mt-0.5">{job.company.name}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.workMode && (
                      <span className="text-xs border border-gray-200 px-2 py-0.5 text-gray-500">{job.workMode}</span>
                    )}
                    {job.employmentType && (
                      <span className="text-xs border border-gray-200 px-2 py-0.5 text-gray-500">{job.employmentType}</span>
                    )}
                    {job.experienceLevel && (
                      <span className="text-xs border border-gray-200 px-2 py-0.5 text-gray-500">{job.experienceLevel}</span>
                    )}
                    {job.budgetMin && job.budgetMax && (
                      <span className="text-xs border border-gray-200 px-2 py-0.5 text-gray-500">
                        ${job.budgetMin} — ${job.budgetMax}
                      </span>
                    )}
                  </div>
                  {job.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.skills.slice(0, 5).map((s, i) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button className={BTN_PRIMARY}>Apply</button>
                  {job.recruiterId && (
                    <button
                      onClick={() => handleMessageRecruiter(job)}
                      disabled={messaging === job.id}
                      className={BTN_OUTLINE}
                    >
                      {messaging === job.id ? 'Opening…' : 'Message'}
                    </button>
                  )}
                </div>
              </div>
              {job.description && (
                <p className="text-sm text-gray-500 mt-3 line-clamp-2">{job.description}</p>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={BTN_OUTLINE}
            >
              ← Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={BTN_OUTLINE}
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}