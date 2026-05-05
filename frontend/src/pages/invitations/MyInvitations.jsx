import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyInvitations, respondToInvitation } from '../../services/invitations';

const STATUS_CLASS = {
  pending:  'badge badge-amber',
  accepted: 'badge badge-green',
  rejected: 'badge badge-red',
};

export default function MyInvitations() {
  const [result,  setResult]  = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyInvitations().then(setResult).finally(() => setLoading(false));
  }, []);

  async function respond(id, response) {
    try {
      await respondToInvitation(id, response);
      setResult(prev => ({
        ...prev,
        data: prev.data.map(inv => inv.id === id ? { ...inv, status: response } : inv),
      }));
    } catch (err) {
      alert(err.response?.data?.message ?? 'Failed to respond');
    }
  }

  if (loading) return <div style={s.page}><p style={{ color: '#9CA3AF' }}>Loading...</p></div>;

  return (
    <div style={s.page}>
      <h1 style={s.title}>My Invitations</h1>
      <p style={s.sub}>{result.total} invitation{result.total !== 1 ? 's' : ''}</p>

      {result.data.length === 0 ? (
        <div className="card" style={s.empty}>
          <p style={s.emptyText}>No invitations yet.</p>
        </div>
      ) : (
        <div style={s.list}>
          {result.data.map(inv => (
            <div key={inv.id} className="card" style={s.card}>
              <div style={s.cardTop}>
                <div>
                  <p style={s.company}>{inv.companyName ?? 'A company'}</p>
                  {inv.jobTitle && (
                    <Link to={`/jobs/${inv.jobId}`} style={s.jobLink}>{inv.jobTitle}</Link>
                  )}
                </div>
                <span className={STATUS_CLASS[inv.status] ?? 'badge badge-amber'}>{inv.status}</span>
              </div>

              <div style={s.offerRow}>
                <span style={s.offerChip}>${inv.priceOffer?.toLocaleString()}</span>
                <span style={s.offerChip}>{inv.deliveryTimeDays} days</span>
              </div>

              {inv.message && <p style={s.message}>"{inv.message}"</p>}

              {inv.status === 'pending' && (
                <div style={s.btns}>
                  <button style={s.acceptBtn} onClick={() => respond(inv.id, 'accepted')}>
                    Accept — Create Contract
                  </button>
                  <button style={s.rejectBtn} onClick={() => respond(inv.id, 'rejected')}>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page:      { maxWidth: 760, margin: '0 auto', padding: '2rem 1.5rem' },
  title:     { fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' },
  sub:       { color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' },
  list:      { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card:      { padding: '1.25rem 1.5rem' },
  cardTop:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' },
  company:   { margin: '0 0 0.15rem', fontWeight: 700, color: '#111827', fontSize: '0.95rem' },
  jobLink:   { fontSize: '0.875rem', color: '#2563EB' },
  offerRow:  { display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' },
  offerChip: { fontSize: '0.85rem', padding: '3px 10px', background: '#F3F4F6', borderRadius: 999, color: '#374151', fontWeight: 500 },
  message:   { margin: '0 0 0.875rem', fontSize: '0.875rem', color: '#6B7280', fontStyle: 'italic' },
  btns:      { display: 'flex', gap: '0.75rem' },
  acceptBtn: { padding: '0.5rem 1.1rem', background: '#059669', color: '#fff', border: 'none', borderRadius: 999, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' },
  rejectBtn: { padding: '0.5rem 1.1rem', background: '#fff', color: '#DC2626', border: '1.5px solid #DC2626', borderRadius: 999, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' },
  empty:     { padding: '3rem 2rem', textAlign: 'center' },
  emptyText: { color: '#6B7280', fontSize: '1rem' },
};
