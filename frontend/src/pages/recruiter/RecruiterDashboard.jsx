import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { subscriptionService } from '../../services/subscriptionService';
import Header from '../../components/Header';
import Modal from '../../components/admin/Modal';

const API_URL = 'http://localhost:3001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
const WORK_MODES = ['remote', 'on-site', 'hybrid'];

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [subscription, setSubscription] = useState(undefined);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [showSubBanner, setShowSubBanner] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [jobError, setJobError] = useState('');
  const [jobForm, setJobForm] = useState({
    title: '', description: '', employmentType: 'full-time',
    workMode: 'remote', budgetMin: '', budgetMax: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [subData, jobsRes] = await Promise.all([
          subscriptionService.getMySubscription(),
          axios.get(`${API_URL}/jobs`, { headers: getAuthHeader() }),
        ]);
        setSubscription(subData);
        setJobs(jobsRes.data.data ?? []);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setSubscription(null);
      } finally {
        setLoadingJobs(false);
      }
    };
    load();
  }, []);

  const handlePostJobClick = () => {
    if (!subscription || subscription.status !== 'active') {
      setShowSubBanner(true);
      return;
    }
    setShowSubBanner(false);
    setJobError('');
    setJobForm({ title: '', description: '', employmentType: 'full-time', workMode: 'remote', budgetMin: '', budgetMax: '' });
    setShowJobModal(true);
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.description) {
      setJobError('Title and description are required');
      return;
    }
    try {
      setSubmitting(true);
      setJobError('');
      await axios.post(`${API_URL}/jobs`, {
        ...jobForm,
        budgetMin: jobForm.budgetMin ? Number(jobForm.budgetMin) : null,
        budgetMax: jobForm.budgetMax ? Number(jobForm.budgetMax) : null,
        skillIds: [],
        categoryIds: [],
      }, { headers: getAuthHeader() });

      setShowJobModal(false);
      const jobsRes = await axios.get(`${API_URL}/jobs`, { headers: getAuthHeader() });
      setJobs(jobsRes.data.data ?? []);
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg?.includes('subscription') || err?.response?.status === 403) {
        setShowJobModal(false);
        setShowSubBanner(true);
        setSubscription(null);
      } else {
        setJobError(msg || 'Failed to post job');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/recruiter/company')}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
            >
              Company Profile
            </button>
            <button
              onClick={handlePostJobClick}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              + Post Job
            </button>
          </div>
        </div>

        {showSubBanner && (
          <div className="mb-6 bg-yellow-50 border border-yellow-300 px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">You need a subscription to post a job</p>
              <p className="text-xs text-yellow-700 mt-0.5">Choose a plan to unlock job postings on your account.</p>
            </div>
            <button
              onClick={() => navigate('/recruiter/subscription')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 whitespace-nowrap"
            >
              View Plans
            </button>
          </div>
        )}

        {subscription && (
          <div className="mb-6 bg-white border border-gray-200 px-4 py-3 flex flex-wrap gap-4 items-center text-sm text-gray-700">
            <span>Plan: <strong>{subscription.planName}</strong></span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {subscription.status}
            </span>
            <span>Job limit: <strong>{subscription.jobLimit == null ? 'Unlimited' : subscription.jobLimit}</strong></span>
            <button
              onClick={() => navigate('/recruiter/subscription')}
              className="ml-auto text-xs text-blue-600 hover:underline"
            >
              Manage subscription →
            </button>
          </div>
        )}

        {loadingJobs ? (
          <p className="text-gray-400 text-sm">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No jobs posted yet</p>
            <p className="text-sm mt-1">Click "Post Job" to add your first listing</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white border border-gray-200 px-5 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{job.employmentType} · {job.workMode}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 font-medium ${job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {job.status}
                  </span>
                </div>
                {job.budgetMin && (
                  <p className="text-sm text-gray-600 mt-2">
                    Budget: ${job.budgetMin.toLocaleString()} – ${job.budgetMax?.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showJobModal} onClose={() => setShowJobModal(false)} title="Post a New Job" size="lg">
        <form onSubmit={handleJobSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input
              type="text"
              value={jobForm.title}
              onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Senior Frontend Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={jobForm.description}
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the role, responsibilities, and requirements..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select
                value={jobForm.employmentType}
                onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
              <select
                value={jobForm.workMode}
                onChange={(e) => setJobForm({ ...jobForm, workMode: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Min ($)</label>
              <input
                type="number"
                min="0"
                value={jobForm.budgetMin}
                onChange={(e) => setJobForm({ ...jobForm, budgetMin: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 3000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Max ($)</label>
              <input
                type="number"
                min="0"
                value={jobForm.budgetMax}
                onChange={(e) => setJobForm({ ...jobForm, budgetMax: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 5000"
              />
            </div>
          </div>

          {jobError && <p className="text-sm text-red-600">{jobError}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Job'}
            </button>
            <button
              type="button"
              onClick={() => setShowJobModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RecruiterDashboard;
