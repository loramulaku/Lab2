import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import recruiterService from '../../services/recruiterService';
import { subscriptionService } from '../../services/subscriptionService';
import { useNotifications } from '../../context/NotificationContext';

const STATUS_CLS = {
  pending:   'bg-yellow-100 text-yellow-800',
  accepted:  'bg-green-100 text-green-800',
  rejected:  'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
  active:    'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  open:      'bg-green-100 text-green-700',
  closed:    'bg-gray-100 text-gray-500',
};
const Badge = ({ status }) => (
  <span className={`text-xs px-2 py-0.5 font-medium rounded ${STATUS_CLS[status] ?? 'bg-gray-100 text-gray-600'}`}>
    {status}
  </span>
);

export default function RecruiterDashboard() {
  const [jobs, setJobs]             = useState([]);
  const [sub,  setSub]              = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading]       = useState(true);
  const { lastApplicationEvent }    = useNotifications();

  useEffect(() => {
    const load = async () => {
      try {
        const [jobsRes, subRes, candRes, freRes] = await Promise.allSettled([
          recruiterService.listJobs({ limit: 100 }),
          subscriptionService.getMySubscription(),
          recruiterService.getApplicants({ limit: 5 }),
          recruiterService.getFreelancers({ limit: 5 }),
        ]);
        if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data ?? []);
        if (subRes.status  === 'fulfilled') setSub(subRes.value);
        if (candRes.status === 'fulfilled') setCandidates(candRes.value.data ?? []);
        if (freRes.status  === 'fulfilled') setFreelancers(freRes.value.data ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Re-fetch candidates list whenever a new application arrives via socket.
  useEffect(() => {
    if (!lastApplicationEvent) return;
    recruiterService.getApplicants({ limit: 5 })
      .then(r => setCandidates(r.data ?? []))
      .catch(() => {});
  }, [lastApplicationEvent]);

  const open   = jobs.filter(j => j.status === 'open').length;
  const closed = jobs.filter(j => j.status === 'closed').length;

  return (
    <RecruiterLayout title="Overview">
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <div className="space-y-6">
          {/* Subscription bar */}
          {sub && (
            <div className="bg-white border border-gray-200 px-5 py-4 flex flex-wrap gap-6 items-center text-sm text-gray-700">
              <span>Plan: <strong>{sub.planName ?? 'Unknown'}</strong></span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {sub.status}
              </span>
              <span>Job limit: <strong>{sub.jobLimit == null ? 'Unlimited' : sub.jobLimit}</strong></span>
              <Link to="/recruiter/billing/upgrade" className="ml-auto text-xs text-blue-600 hover:underline">
                Manage subscription →
              </Link>
            </div>
          )}

          {!sub && (
            <div className="bg-yellow-50 border border-yellow-300 px-5 py-4 flex items-center justify-between">
              <p className="text-sm font-medium text-yellow-800">No active subscription — you cannot post jobs.</p>
              <Link to="/recruiter/billing/upgrade" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                View Plans
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Open Jobs',      value: open,               href: '/recruiter/jobs' },
              { label: 'Closed Jobs',    value: closed,             href: '/recruiter/jobs' },
              { label: 'Candidates',     value: candidates.length,  href: '/recruiter/applicants/job-seekers' },
              { label: 'Freelancers',    value: freelancers.length, href: '/recruiter/applicants/freelance' },
            ].map(({ label, value, href }) => (
              <Link key={label} to={href}
                className="bg-white border border-gray-200 px-5 py-4 hover:border-blue-300 transition-colors">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Candidates */}
            <div className="bg-white border border-gray-200 px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Candidates</h2>
                <Link to="/recruiter/applicants/job-seekers" className="text-xs text-blue-600 hover:underline">View all →</Link>
              </div>
              {candidates.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No candidates yet.</p>
              ) : (
                <div className="space-y-2">
                  {candidates.map(c => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {c.applicantFirstName || c.applicantLastName
                            ? `${c.applicantFirstName ?? ''} ${c.applicantLastName ?? ''}`.trim()
                            : c.applicantEmail ?? `Applicant #${c.id}`}
                        </p>
                        <p className="text-xs text-gray-500">{c.jobTitle ?? '—'}</p>
                      </div>
                      <Badge status={c.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Freelancers */}
            <div className="bg-white border border-gray-200 px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Freelancers</h2>
                <Link to="/recruiter/applicants/freelance" className="text-xs text-blue-600 hover:underline">View all →</Link>
              </div>
              {freelancers.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No freelancer bids yet.</p>
              ) : (
                <div className="space-y-2">
                  {freelancers.map(b => (
                    <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {b.freelancer?.firstName || b.freelancer?.lastName
                            ? `${b.freelancer.firstName ?? ''} ${b.freelancer.lastName ?? ''}`.trim()
                            : `Freelancer #${b.freelancerId}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {b.jobTitle ?? '—'}
                          {b.price != null ? ` · $${Number(b.price).toLocaleString()}` : ''}
                        </p>
                      </div>
                      <Badge status={b.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Job Listings */}
          <div className="bg-white border border-gray-200 px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Recent Job Listings</h2>
              <Link to="/recruiter/jobs" className="text-xs text-blue-600 hover:underline">View all →</Link>
            </div>
            {jobs.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                No jobs yet. <Link to="/recruiter/jobs?post=1" className="text-blue-600 hover:underline">Post your first job →</Link>
              </p>
            ) : (
              <div className="space-y-2">
                {jobs.slice(0, 5).map(j => (
                  <div key={j.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{j.title}</p>
                      <p className="text-xs text-gray-500">{j.employmentType ?? 'Freelance'} · {j.workMode}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {(j.applicationCount > 0) && <span>{j.applicationCount} app{j.applicationCount !== 1 ? 's' : ''}</span>}
                      {(j.bidCount > 0)          && <span>{j.bidCount} bid{j.bidCount !== 1 ? 's' : ''}</span>}
                      <Badge status={j.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </RecruiterLayout>
  );
}
