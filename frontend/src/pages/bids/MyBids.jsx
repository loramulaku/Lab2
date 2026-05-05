import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBids } from '../../services/bids';

const STATUS_CLASS = {
  pending:  'badge badge-amber',
  accepted: 'badge badge-green',
  rejected: 'badge badge-red',
};

export default function MyBids() {
  const [result,  setResult]  = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBids().then(setResult).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={s.page}><p style={{ color: '#9CA3AF' }}>Loading...</p></div>;

  return (
    <div style={s.page}>
      <h1 style={s.title}>My Bids</h1>
      <p style={s.sub}>{result.total} bid{result.total !== 1 ? 's' : ''}</p>

      {result.data.length === 0 ? (
        <div className="card" style={s.empty}>
          <p style={s.emptyText}>No bids yet.</p>
          <Link to="/jobs" className="btn-primary" style={{ marginTop: '1rem' }}>Browse Freelance Jobs</Link>
        </div>
      ) : (
        <div style={s.list}>
          {result.data.map(bid => (
            <div key={bid.id} className="card" style={s.card}>
              <div style={s.cardLeft}>
                <Link to={`/jobs/${bid.jobId}`} style={s.jobLink}>
                  {bid.jobTitle ?? `Job #${bid.jobId}`}
                </Link>
                <p style={s.company}>{bid.companyName ?? '—'}</p>
                <div style={s.metaRow}>
                  <span style={s.pill}>${bid.price?.toLocaleString()}</span>
                  <span style={s.pill}>{bid.deliveryTimeDays} days</span>
                </div>
                {bid.message && <p style={s.message}>"{bid.message}"</p>}
              </div>
              <span className={STATUS_CLASS[bid.status] ?? 'badge badge-amber'}>{bid.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page:     { maxWidth: 760, margin: '0 auto', padding: '2rem 1.5rem' },
  title:    { fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' },
  sub:      { color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' },
  list:     { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  card:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 1.5rem', gap: '1rem' },
  cardLeft: { display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 },
  jobLink:  { fontWeight: 600, color: '#2563EB', fontSize: '0.95rem' },
  company:  { margin: 0, color: '#6B7280', fontSize: '0.875rem' },
  metaRow:  { display: 'flex', gap: '0.5rem' },
  pill:     { fontSize: '0.8rem', padding: '2px 8px', background: '#F3F4F6', borderRadius: 999, color: '#374151', fontWeight: 500 },
  message:  { margin: 0, fontSize: '0.8rem', color: '#6B7280', fontStyle: 'italic' },
  empty:    { padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  emptyText:{ color: '#6B7280', fontSize: '1rem' },
};
