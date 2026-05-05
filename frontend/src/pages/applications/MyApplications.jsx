import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../../services/applications';

const STAGE_CLASS = {
  applied:   'badge badge-blue',
  screening: 'badge badge-amber',
  interview: 'badge badge-purple',
  offer:     'badge badge-green',
  hired:     'badge badge-green',
  rejected:  'badge badge-red',
};

export default function MyApplications() {
  const [result,  setResult]  = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications().then(setResult).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={s.page}><p style={{ color: '#9CA3AF' }}>Loading...</p></div>;

  return (
    <div style={s.page}>
      <h1 style={s.title}>My Applications</h1>
      <p style={s.sub}>{result.total} application{result.total !== 1 ? 's' : ''}</p>

      {result.data.length === 0 ? (
        <div className="card" style={s.empty}>
          <p style={s.emptyText}>No applications yet.</p>
          <Link to="/jobs" className="btn-primary" style={{ marginTop: '1rem' }}>Browse Jobs</Link>
        </div>
      ) : (
        <div style={s.list}>
          {result.data.map(app => (
            <div key={app.id} className="card" style={s.card}>
              <div style={s.cardLeft}>
                <Link to={`/jobs/${app.jobId}`} style={s.jobLink}>
                  {app.jobTitle ?? `Job #${app.jobId}`}
                </Link>
                <p style={s.company}>{app.companyName ?? '—'}</p>
                <p style={s.date}>Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}</p>
              </div>
              <span className={STAGE_CLASS[app.currentStage] ?? 'badge badge-blue'}>
                {app.currentStage ?? 'applied'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page:    { maxWidth: 760, margin: '0 auto', padding: '2rem 1.5rem' },
  title:   { fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' },
  sub:     { color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' },
  list:    { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  card:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 1.5rem' },
  cardLeft:{ display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  jobLink: { fontWeight: 600, color: '#2563EB', fontSize: '0.95rem' },
  company: { margin: 0, color: '#6B7280', fontSize: '0.875rem' },
  date:    { margin: 0, fontSize: '0.8rem', color: '#9CA3AF' },
  empty:   { padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  emptyText:{ color: '#6B7280', fontSize: '1rem' },
};
