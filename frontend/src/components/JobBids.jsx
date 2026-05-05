import { useEffect, useState } from 'react';
import { getJobBids } from '../services/bids';

export default function JobBids({ jobId }) {
  const [result,  setResult]  = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJobBids(jobId).then(setResult).finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <p>Loading bids...</p>;

  return (
    <div style={styles.wrap}>
      <h3 style={styles.heading}>Bids ({result.total})</h3>
      {result.data.length === 0 && <p style={styles.empty}>No bids yet.</p>}
      {result.data.map(bid => (
        <div key={bid.id} style={styles.row}>
          <div style={styles.left}>
            <p style={styles.name}>{bid.freelancerFirstName} {bid.freelancerLastName}</p>
            <p style={styles.meta}>{bid.message}</p>
          </div>
          <div style={styles.right}>
            <p style={styles.price}>${bid.price}</p>
            <p style={styles.days}>{bid.deliveryTimeDays} days</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  wrap:  { marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' },
  heading:{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' },
  empty: { color: '#9ca3af', fontSize: '0.875rem' },
  row:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' },
  left:  { flex: 1 },
  name:  { margin: 0, fontWeight: 500 },
  meta:  { margin: 0, fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic' },
  right: { textAlign: 'right' },
  price: { margin: 0, fontWeight: 600, color: '#059669' },
  days:  { margin: 0, fontSize: '0.8rem', color: '#9ca3af' },
};
