import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import StatusBadge from '../../components/recruiter/StatusBadge';
import recruiterService from '../../services/recruiterService';
import freelanceService from '../../services/freelanceService';
import { subscriptionService } from '../../services/subscriptionService';

const Stat = ({ label, value, to }) => {
  const body = (
    <div className="page-shell-card rounded-xl p-5">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
};

export default function Overview() {
  const [sub, setSub] = useState(undefined);
  const [counts, setCounts] = useState({ open: 0, closed: 0, archived: 0, contracts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [subRes, profile, contractsRes] = await Promise.allSettled([
          subscriptionService.getMySubscription(),
          recruiterService.getProfile(),
          freelanceService.myContracts({ limit: 200 }),
        ]);
        setSub(subRes.status === 'fulfilled' ? subRes.value : null);
        const cid = profile.status === 'fulfilled' ? profile.value?.company?.id : null;
        let open = 0, closed = 0, archived = 0;
        if (cid) {
          const jobsRes = await recruiterService.listJobs({ companyId: cid, limit: 200 });
          for (const j of (jobsRes.data ?? [])) {
            if (j.status === 'open') open++;
            else if (j.status === 'closed') closed++;
            else if (j.status === 'archived') archived++;
          }
        }
        const contracts = contractsRes.status === 'fulfilled' ? (contractsRes.value.total ?? contractsRes.value.data?.length ?? 0) : 0;
        setCounts({ open, closed, archived, contracts });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <RecruiterLayout title="Overview">
      {loading ? <p className="text-sm text-gray-400">Loading…</p> : (
        <div className="space-y-6">
          <div className="page-shell-card rounded-xl px-5 py-4 flex flex-wrap items-center gap-4">
            {sub ? (
              <>
                <span className="text-sm text-gray-700">Plan: <strong>{sub.planName}</strong></span>
                <StatusBadge status={sub.status} />
                <span className="text-sm text-gray-700">Job limit: <strong>{sub.jobLimit == null ? 'Unlimited' : sub.jobLimit}</strong></span>
                <Link to="/recruiter/billing/plan" className="ml-auto text-sm text-blue-600 hover:underline">Manage plan →</Link>
              </>
            ) : (
              <>
                <span className="text-sm text-yellow-800">No active subscription — you can't post jobs yet.</span>
                <Link to="/recruiter/billing/upgrade" className="ml-auto px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700">Choose a plan</Link>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Open Jobs" value={counts.open} to="/recruiter/jobs" />
            <Stat label="Closed Jobs" value={counts.closed} to="/recruiter/jobs" />
            <Stat label="Archived Jobs" value={counts.archived} to="/recruiter/jobs/archived" />
            <Stat label="Contracts" value={counts.contracts} to="/recruiter/contracts" />
          </div>

          <div className="page-shell-card rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Quick actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link to="/recruiter/jobs?post=1" className="px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700">+ Post a Job</Link>
              <Link to="/recruiter/freelancers/active" className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50">Search Freelancers</Link>
              <Link to="/recruiter/bids" className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50">Review Bids</Link>
              <Link to="/recruiter/contracts" className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50">View Contracts</Link>
            </div>
          </div>
        </div>
      )}
    </RecruiterLayout>
  );
}
