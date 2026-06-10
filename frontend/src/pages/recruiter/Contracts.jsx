import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import freelanceService from '../../services/freelanceService';

export default function Contracts() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await freelanceService.myContracts({ limit: 200 });
        setContracts(res.data ?? []);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <RecruiterLayout title="Contracts">
      {loading ? <p className="text-sm text-gray-400">Loading…</p>
        : contracts.length === 0 ? (
          <div className="page-shell-card rounded-xl text-center py-16 text-gray-400">
            <p className="text-lg">No contracts yet</p>
            <p className="text-sm mt-1">Accept a bid or have a freelancer accept an invitation to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map(c => {
              const freelancerName = c.freelancer
                ? `${c.freelancer.firstName} ${c.freelancer.lastName}`
                : `Freelancer #${c.freelancerId}`;
              const isHired = c.status === 'active';
              return (
                <div key={c.id} className="page-shell-card rounded-xl px-5 py-4 flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{c.jobTitle ?? `Job #${c.jobId}`}</h3>
                      {isHired ? (
                        <span className="text-xs px-2 py-0.5 font-medium bg-green-100 text-green-800 whitespace-nowrap">
                          Hired
                        </span>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 font-medium whitespace-nowrap ${
                          c.status === 'pending'  ? 'bg-yellow-100 text-yellow-800' :
                          c.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {c.status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {freelancerName} · via {c.source}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">${Number(c.agreedPrice ?? 0).toLocaleString()}</p>
                    {c.startDate && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Start: {c.startDate}{c.endDate ? ` → ${c.endDate}` : ''}
                      </p>
                    )}
                  </div>
                  <button onClick={() => navigate('/chat')} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">Open Chat</button>
                </div>
              );
            })}
          </div>
        )}
    </RecruiterLayout>
  );
}
