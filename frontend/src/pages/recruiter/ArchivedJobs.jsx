import { useEffect, useState } from 'react';
import RecruiterLayout from '../../components/recruiter/RecruiterLayout';
import StatusBadge from '../../components/recruiter/StatusBadge';
import recruiterService from '../../services/recruiterService';

export default function ArchivedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const profile = await recruiterService.getProfile();
        const cid = profile?.company?.id ?? null;
        const res = await recruiterService.listJobs({ companyId: cid, status: 'archived', limit: 200 });
        setJobs(res.data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <RecruiterLayout title="Archived Jobs">
      {loading ? <p className="text-sm text-gray-400">Loading…</p>
        : jobs.length === 0 ? (
          <div className="bg-white border border-gray-200 text-center py-16 text-gray-400">
            <p className="text-lg">No archived jobs</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="bg-white border border-gray-200 px-5 py-4 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-700">{job.title}</h3>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">{job.employmentType} · {job.workMode}</p>
                </div>
              </div>
            ))}
          </div>
        )}
    </RecruiterLayout>
  );
}
