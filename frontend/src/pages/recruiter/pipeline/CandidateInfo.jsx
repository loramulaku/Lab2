import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RecruiterLayout from '../../../components/recruiter/RecruiterLayout';
import api from '../../../services/api';

function Row({ label, value }) {
  if (!value && value !== 0 && value !== false) return null;
  return (
    <div className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="w-40 flex-shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 flex-1">{value}</span>
    </div>
  );
}

export default function CandidateInfo() {
  const { applicationId } = useParams();
  const navigate          = useNavigate();
  const [app, setApp]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    // The recruiter's getApplicants endpoint returns all applications.
    // We fetch the specific one by filtering by id from MongoDB via the recruiter route.
    api.get(`/recruiter/applicants?limit=500`)
      .then(r => {
        const found = (r.data?.data ?? []).find(a => String(a.id) === String(applicationId));
        if (!found) throw new Error('Not found');
        setApp(found);
      })
      .catch(() => setError('Could not load candidate details.'))
      .finally(() => setLoading(false));
  }, [applicationId]);

  const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api').replace('/api', '');

  return (
    <RecruiterLayout title="Candidate Info">
      <button
        onClick={() => navigate('/recruiter/pipeline/board')}
        className="text-sm text-blue-600 hover:underline mb-5 flex items-center gap-1"
      >
        ← Back to Pipeline Board
      </button>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error   && <p className="text-sm text-red-600">{error}</p>}

      {app && (
        <div className="max-w-2xl space-y-5">
          {/* Header card */}
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                {`${(app.applicant?.firstName ?? '')[0] ?? ''}${(app.applicant?.lastName ?? '')[0] ?? ''}`.toUpperCase() || '?'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {app.applicant?.firstName} {app.applicant?.lastName}
                </h2>
                <p className="text-sm text-gray-500">{app.applicant?.email}</p>
                {app.jobTitle && <p className="text-sm text-blue-600 mt-0.5">{app.jobTitle}</p>}
              </div>
              <span className={`ml-auto px-3 py-1 text-xs font-semibold rounded-full ${
                app.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                app.status === 'accepted' ? 'bg-green-100 text-green-700'  :
                app.status === 'rejected' ? 'bg-red-100 text-red-700'      :
                'bg-gray-100 text-gray-600'
              }`}>{app.status}</span>
            </div>
          </div>

          {/* Application details */}
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-2 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 py-3 border-b border-gray-100">Application Details</h3>
            <Row label="Applied On"          value={app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : null} />
            <Row label="Phone"               value={app.applicant?.phone ?? app.phone} />
            <Row label="Expected Salary"     value={app.expectedSalary != null ? `$${Number(app.expectedSalary).toLocaleString()}` : null} />
            <Row label="Available From"      value={app.availableFrom} />
            <Row label="Years Experience"    value={app.yearsExperience != null ? `${app.yearsExperience} yr${app.yearsExperience !== 1 ? 's' : ''}` : null} />
            <Row label="Willing to Relocate" value={app.willingToRelocate != null ? (app.willingToRelocate ? 'Yes' : 'No') : null} />
            {app.interviewAt && (
              <Row label="Interview At" value={new Date(app.interviewAt).toLocaleString()} />
            )}
          </div>

          {/* Cover letter */}
          {app.coverLetter && (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Cover Letter</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50 border border-gray-100 rounded-lg p-4">
                {app.coverLetter}
              </p>
            </div>
          )}

          {/* CV */}
          {app.cvPath && (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">CV / Resume</h3>
                <p className="text-xs text-gray-400 mt-0.5">Click to download or view</p>
              </div>
              <a href={`${API_BASE}${app.cvPath}`} target="_blank" rel="noreferrer"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-lg">
                Download CV
              </a>
            </div>
          )}
        </div>
      )}
    </RecruiterLayout>
  );
}
