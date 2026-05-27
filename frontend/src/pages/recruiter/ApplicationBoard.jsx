import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { MagnifyingGlassIcon, Squares2X2Icon, TableCellsIcon } from '@heroicons/react/24/outline';
import SiteLayout from '../../components/SiteLayout';
import Toast from '../../components/Toast';
import PageHeader from '../../components/PageHeader';
import { PageError } from '../../components/PageFeedback';
import useToast from '../../hooks/useToast';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';
import ApplicationKanbanColumn from '../../components/recruiter/ApplicationKanbanColumn';
import ApplicationKanbanCard from '../../components/recruiter/ApplicationKanbanCard';
import ApplicationDetailModal from '../../components/recruiter/ApplicationDetailModal';
import ApplicationContextMenu from '../../components/recruiter/ApplicationContextMenu';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import {
  extractJobs,
  extractApplications,
  normalizeApplication,
} from '../../utils/dashboard';
import { KANBAN_COLUMNS, COLUMN_IDS, groupByStatus, candidateName } from '../../utils/kanban';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:3001';

export default function ApplicationBoard() {
  const location = useLocation();
  const { toast, showToast, dismissToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobFilter, setJobFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('kanban');
  const [activeId, setActiveId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [error, setError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const jobsResponse = await jobService.getMyJobs();
      const jobList = extractJobs(jobsResponse);

      const results = await Promise.allSettled(
        jobList.map((job) => applicationService.getApplicationsByJob(job.id))
      );

      const allApplications = [];
      jobList.forEach((job, index) => {
        const result = results[index];
        if (result.status !== 'fulfilled') return;
        extractApplications(result.value).forEach((app) => {
          allApplications.push(normalizeApplication(app, job));
        });
      });

      setJobs(jobList);
      setApplications(allApplications);
    } catch (err) {
      console.error(err);
      setError('Unable to load applications.');
      showToast('Unable to load applications.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const targetId = location.state?.applicationId;
    if (!targetId || !applications.length) return;
    const app = applications.find((a) => a.id === targetId);
    if (app) setSelectedApp(app);
  }, [location.state, applications]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((app) => {
      if (jobFilter !== 'all' && String(app.jobId) !== jobFilter) return false;
      if (!q) return true;
      const name = candidateName(app).toLowerCase();
      return name.includes(q) || app.jobTitle.toLowerCase().includes(q);
    });
  }, [applications, jobFilter, search]);

  const grouped = useMemo(() => groupByStatus(filtered), [filtered]);
  const activeApp = activeId ? applications.find((a) => String(a.id) === activeId) : null;
  const showJobTitle = jobFilter === 'all';

  const updateStatusOptimistic = async (appId, newStatus) => {
    const previous = applications.find((a) => a.id === appId);
    if (!previous || previous.status === newStatus) return;

    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );

    try {
      await applicationService.updateStatus(appId, newStatus);
      showToast(`Moved to ${newStatus}`);
    } catch (err) {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: previous.status } : a))
      );
      showToast(err.response?.data?.message ?? 'Failed to update status.', 'error');
    }
  };

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;

    const newStatus = COLUMN_IDS.includes(over.id)
      ? over.id
      : over.data.current?.status;

    if (newStatus && COLUMN_IDS.includes(newStatus)) {
      updateStatusOptimistic(Number(active.id), newStatus);
    }
  };

  const handleContextAction = (action, app) => {
    setContextMenu(null);
    if (action === 'view') setSelectedApp(app);
    if (action === 'download' && app.resumePath) {
      window.open(`${API_BASE}${app.resumePath}`, '_blank');
    }
    if (action === 'reject') updateStatusOptimistic(app.id, 'rejected');
    if (action === 'archive') updateStatusOptimistic(app.id, 'rejected');
  };

  return (
    <SiteLayout>
      <Toast toast={toast} onDismiss={dismissToast} />
      <PageHeader
        title="Applications"
        subtitle="Review and manage candidate pipeline."
        className="mb-6"
        actions={(
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="input-field py-2"
            >
              <option value="all">All jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={String(job.id)}>{job.title}</option>
              ))}
            </select>

            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidates…"
                className="input-field pl-9 py-2 w-52"
              />
            </div>

            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setView('kanban')}
                className={`px-3 py-2 text-sm flex items-center gap-1.5 ${
                  view === 'kanban' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" /> Kanban
              </button>
              <button
                type="button"
                onClick={() => setView('table')}
                className={`px-3 py-2 text-sm flex items-center gap-1.5 border-l border-gray-200 ${
                  view === 'table' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <TableCellsIcon className="w-4 h-4" /> Table
              </button>
            </div>
          </div>
        )}
      />

      {error && <PageError message={error} onRetry={loadData} className="mb-5" />}

        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {KANBAN_COLUMNS.map((col) => (
              <div key={col.id} className="min-w-[280px] h-96 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : view === 'kanban' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {KANBAN_COLUMNS.map((column) => (
                <ApplicationKanbanColumn
                  key={column.id}
                  column={column}
                  applications={grouped[column.id]}
                  showJobTitle={showJobTitle}
                  activeId={activeId}
                  onOpen={setSelectedApp}
                  onContextMenu={(e, app) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, app });
                  }}
                />
              ))}
            </div>
            <DragOverlay>
              {activeApp ? (
                <ApplicationKanbanCard
                  app={activeApp}
                  showJobTitle={showJobTitle}
                  isDragging
                  onOpen={() => {}}
                  onContextMenu={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-5 py-3">Job</th>
                  <th className="px-5 py-3">Applied</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((app, i) => (
                    <tr
                      key={app.id}
                      className={`border-b border-gray-100 hover:bg-gray-100 ${i % 2 === 1 ? 'bg-gray-50' : ''}`}
                    >
                      <td className="px-5 py-3 font-medium text-gray-900">{candidateName(app)}</td>
                      <td className="px-5 py-3 text-gray-700">{app.jobTitle}</td>
                      <td className="px-5 py-3 text-gray-500">
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3"><ApplicationStatusBadge status={app.status} /></td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedApp(app)}
                          className="text-xs font-medium text-brand-600 hover:text-brand-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      <ApplicationDetailModal
        app={selectedApp}
        onClose={() => setSelectedApp(null)}
        onReject={(app) => {
          updateStatusOptimistic(app.id, 'rejected');
          setSelectedApp(null);
        }}
      />

      <ApplicationContextMenu
        menu={contextMenu}
        onClose={() => setContextMenu(null)}
        onAction={handleContextAction}
      />
    </SiteLayout>
  );
}
