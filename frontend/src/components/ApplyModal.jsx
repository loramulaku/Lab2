import { useState } from 'react';
import { applyToJob } from '../services/applications';

export default function ApplyModal({ jobId, onClose }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [done,    setDone]    = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await applyToJob(jobId, { coverLetter: coverLetter || undefined });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to apply');
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
            <p style={{ textAlign: 'center', fontWeight: 600 }}>Application submitted!</p>
            <button style={closeBtn} onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            <h2 style={modalTitle}>Apply for this job</h2>
            <form onSubmit={handleSubmit} style={formStyle}>
              <label style={labelStyle}>Cover Letter (optional)</label>
              <textarea
                style={textareaStyle}
                rows={5}
                placeholder="Tell the recruiter why you're a great fit..."
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
              />
              {error && <p style={errorStyle}>{error}</p>}
              <div style={btnRow}>
                <button type="button" style={cancelBtn} onClick={onClose}>Cancel</button>
                <button type="submit" style={submitBtnStyle} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Application'}
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
const labelStyle  = { fontWeight: 600, fontSize: '0.9rem' };
const textareaStyle = { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', resize: 'vertical' };
const errorStyle  = { color: '#dc2626', fontSize: '0.875rem' };
const btnRow      = { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' };
const cancelBtn   = { padding: '0.5rem 1rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' };
const submitBtnStyle = { padding: '0.5rem 1.25rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' };
const closeBtn    = { display: 'block', margin: '1rem auto 0', padding: '0.5rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' };
