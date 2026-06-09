import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { List, Lock, Archive, FileText } from 'lucide-react';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import StatusBadge from '../../components/recruiter/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import recruiterService from '../../services/recruiterService';
import freelanceService from '../../services/freelanceService';
import { subscriptionService } from '../../services/subscriptionService';

const TONE = {
  blue:  'bg-blue-50 text-blue-600',
  gray:  'bg-gray-100 text-gray-500',
  amber: 'bg-amber-50 text-amber-600',
  green: 'bg-green-50 text-green-600',
};

const Stat = ({ label, value, to, icon: Icon, tone = 'blue' }) => {
  const body = (
    <div className="page-shell-card rounded-xl p-5 flex items-center gap-4 hover:border-blue-300 transition-colors h-full">
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${TONE[tone]}`}>
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to} className="block h-full">{body}</Link> : body;
};

export default function Overview() {
  const { user } = useAuth();
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
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ''} 👋
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your hiring today.</p>
          </div>

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
                <Link to="/recruiter/billing/upgrade" className="ml-auto px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Choose a plan</Link>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Open Jobs"     value={counts.open}      to="/recruiter/jobs"          icon={List}     tone="blue"  />
            <Stat label="Closed Jobs"   value={counts.closed}    to="/recruiter/jobs"          icon={Lock}     tone="gray"  />
            <Stat label="Archived Jobs" value={counts.archived}  to="/recruiter/jobs/archived" icon={Archive}  tone="amber" />
            <Stat label="Contracts"     value={counts.contracts} to="/recruiter/contracts"     icon={FileText} tone="green" />
          </div>

          <div className="page-shell-card rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Quick actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link to="/recruiter/jobs?post=1" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">+ Post a Job</Link>
              <Link to="/recruiter/freelancers/active" className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">Search Freelancers</Link>
              <Link to="/recruiter/bids" className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">Review Bids</Link>
              <Link to="/recruiter/contracts" className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">View Contracts</Link>
            </div>
          </div>
        </div>
      )}
    </RecruiterLayout>
  );
}
