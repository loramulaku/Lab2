import { useEffect, useState } from 'react';
import { getJobApplications } from '../services/applications';

export default function JobApplications({ jobId }) {
  const [result,  setResult]  = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJobApplications(jobId).then(setResult).finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <p>Loading applicants...</p>;

  return (
    <div style={styles.wrap}>
      <h3 style={styles.heading}>Applicants ({result.total})</h3>
      {result.data.length === 0 && <p style={styles.empty}>No applications yet.</p>}
      {result.data.map(app => (
        <div key={app.id} style={styles.row}>
          <div>
            <p style={styles.name}>{app.applicantFirstName} {app.applicantLastName}</p>
            <p style={styles.email}>{app.applicantEmail}</p>
          </div>
          <span style={styles.stage}>{app.currentStage}</span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  wrap:    { marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' },
  heading: { fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' },
  empty:   { color: '#9ca3af', fontSize: '0.875rem' },
  row:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' },
  name:    { margin: 0, fontWeight: 500 },
  email:   { margin: 0, fontSize: '0.8rem', color: '#6b7280' },
  stage:   { fontSize: '0.75rem', padding: '2px 8px', background: '#dbeafe', color: '#1e40af', borderRadius: 999 },
};
