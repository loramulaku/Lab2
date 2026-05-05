import { useState } from 'react';
import { sendInvitation } from '../services/invitations';

export default function InviteFreelancerModal({ jobId, onClose }) {
  const [form, setForm] = useState({ freelancerId: '', price: '', deliveryTimeDays: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [done,    setDone]    = useState(false);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendInvitation({
        freelancerId:     Number(form.freelancerId),
        jobId:            jobId ? Number(jobId) : undefined,
        price:            Number(form.price),
        deliveryTimeDays: Number(form.deliveryTimeDays),
        message:          form.message || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        {done ? (
          <>
            <p style={{ fontSize: '1.5rem', textAlign: 'center' }}>✅</p>
            <p style={{ textAlign: 'center', fontWeight: 600 }}>Invitation sent!</p>
            <button style={closeBtn} onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            <h2 style={modalTitle}>Invite a Freelancer</h2>
            <form onSubmit={handleSubmit} style={formStyle}>
              <label style={labelStyle}>Freelancer ID *</label>
              <input
                type="number" required style={inputStyle}
                placeholder="Enter freelancer user ID"
                value={form.freelancerId} onChange={e => set('freelancerId', e.target.value)}
              />
              <div style={rowStyle}>
                <div style={col}>
                  <label style={labelStyle}>Offered Price ($) *</label>
                  <input
                    type="number" min={1} required style={inputStyle}
                    value={form.price} onChange={e => set('price', e.target.value)}
                  />
                </div>
                <div style={col}>
                  <label style={labelStyle}>Delivery (days) *</label>
                  <input
                    type="number" min={1} required style={inputStyle}
                    value={form.deliveryTimeDays} onChange={e => set('deliveryTimeDays', e.target.value)}
                  />
                </div>
              </div>
              <label style={labelStyle}>Message (optional)</label>
              <textarea
                style={textareaStyle} rows={3}
                placeholder="Why are you inviting this freelancer?"
                value={form.message} onChange={e => set('message', e.target.value)}
              />
              {error && <p style={errorStyle}>{error}</p>}
              <div style={btnRow}>
                <button type="button" style={cancelBtn} onClick={onClose}>Cancel</button>
                <button type="submit" style={submitBtnStyle} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const overlay     = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 };
const modal       = { background: '#fff', borderRadius: 10, padding: '1.75rem', width: '100%', maxWidth: 480 };
const modalTitle  = { margin: '0 0 1rem', fontSize: '1.25rem' };
const formStyle   = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const rowStyle    = { display: 'flex', gap: '1rem' };
const col         = { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' };
const labelStyle  = { fontWeight: 600, fontSize: '0.9rem' };
const inputStyle  = { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem' };
const textareaStyle = { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', resize: 'vertical' };
const errorStyle  = { color: '#dc2626', fontSize: '0.875rem' };
const btnRow      = { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' };
const cancelBtn   = { padding: '0.5rem 1rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' };
const submitBtnStyle = { padding: '0.5rem 1.25rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' };
const closeBtn    = { display: 'block', margin: '1rem auto 0', padding: '0.5rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' };
