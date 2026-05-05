import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJob } from '../../services/jobs';
import { useAuth } from '../../hooks/useAuth';
import ApplyModal from '../../components/ApplyModal';
import BidModal from '../../components/BidModal';
import InviteFreelancerModal from '../../components/InviteFreelancerModal';
import JobApplications from '../../components/JobApplications';
import JobBids from '../../components/JobBids';

function CompanyLogo({ name }) {
  const colors     = ['#DBEAFE', '#EDE9FE', '#FEF3C7', '#D1FAE5', '#FEE2E2'];
  const textColors = ['#1D4ED8', '#6D28D9', '#B45309', '#065F46', '#991B1B'];
  const idx = (name?.charCodeAt(0) ?? 0) % colors.length;
  return (
    <div style={{ width: 64, height: 64, borderRadius: 14, background: colors[idx], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: textColors[idx], flexShrink: 0 }}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export default function JobDetail() {
  const { id }                 = useParams();
  const { isRecruiter }        = useAuth();
  const [job, setJob]          = useState(null);
  const [loading, setLoading]  = useState(true);
  const [modal, setModal]      = useState(null);

  useEffect(() => {
    getJob(id).then(setJob).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={s.page}><p style={{ color: '#9CA3AF' }}>Loading...</p></div>;
  if (!job)    return <div style={s.page}><p style={{ color: '#9CA3AF' }}>Job not found.</p></div>;

  const isClosed    = job.status === 'closed';
  const isFullTime  = job.employmentType === 'full-time';
  const isFreelance = job.employmentType === 'freelance';
  const canBid      = isFreelance && (job.jobMode === 'public' || job.jobMode === 'both');
  const canInvite   = isRecruiter && isFreelance && (job.jobMode === 'invite' || job.jobMode === 'both');

  return (
    <div style={s.page}>
      <Link to="/jobs" style={s.back}>← Back to jobs</Link>

      <div style={s.layout}>
        {/* ── Main column ── */}
        <div style={s.main}>
          {/* Header card */}
          <div className="card" style={s.header}>
            <div style={s.headerInner}>
              <CompanyLogo name={job.company?.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.badges}>
                  {job.employmentType && (
                    <span className={`badge ${job.employmentType === 'freelance' ? 'badge-purple' : 'badge-blue'}`}>
                      {job.employmentType === 'full-time' ? 'Full-Time' : 'Freelance'}
                    </span>
                  )}
                  {job.jobMode && isFreelance && (
                    <span className="badge badge-gray">
                      {job.jobMode.charAt(0).toUpperCase() + job.jobMode.slice(1)}
                    </span>
                  )}
                  <span className={`badge ${isClosed ? 'badge-red' : 'badge-green'}`}>
                    {isClosed ? 'Closed' : 'Open'}
                  </span>
                </div>
                <h1 style={s.title}>{job.title}</h1>
                <p style={s.company}>{job.company?.name ?? '—'}</p>
              </div>
            </div>

            <div style={s.metaRow}>
              {job.workMode        && <span style={s.metaChip}>{job.workMode}</span>}
              {job.experienceLevel && <span style={s.metaChip}>{job.experienceLevel}</span>}
              {job.deadline && (
                <span style={s.metaChip}>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
              )}
            </div>

            {!isClosed && (
              <div style={s.actions}>
                {!isRecruiter && isFullTime && (
                  <button className="btn-primary" onClick={() => setModal('apply')}>Apply Now</button>
                )}
                {!isRecruiter && canBid && (
                  <button className="btn-primary" onClick={() => setModal('bid')}>Submit Bid</button>
                )}
                {canInvite && (
                  <button className="btn-outline" onClick={() => setModal('invite')}>+ Invite Freelancer</button>
                )}
              </div>
            )}
          </div>

          {/* Description card */}
          <div className="card" style={s.section}>
            <h2 style={s.sectionTitle}>Job Description</h2>
            <div style={s.description}>
              {job.description?.split('\n').map((line, i) => (
                <p key={i} style={{ margin: '0 0 0.6rem' }}>{line}</p>
              ))}
            </div>
          </div>

          {job.skills?.length > 0 && (
            <div className="card" style={s.section}>
              <h2 style={s.sectionTitle}>Required Skills</h2>
              <div style={s.skills}>
                {job.skills.map(sk => <span key={sk} className="skill-tag">{sk}</span>)}
              </div>
            </div>
          )}

          {isRecruiter && isFullTime  && <JobApplications jobId={id} />}
          {isRecruiter && isFreelance && canBid && <JobBids jobId={id} />}
        </div>

        {/* ── Sidebar ── */}
        <aside style={s.sidebar}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={s.sideTitle}>Job Overview</h3>
            {(job.budgetMin || job.budgetMax) && (
              <div style={s.sideRow}>
                <span style={s.sideLabel}>Salary / Budget</span>
                <span style={s.sideVal}>
                  ${job.budgetMin?.toLocaleString() ?? '?'} – ${job.budgetMax?.toLocaleString() ?? '?'}
                  {isFullTime ? '/yr' : ''}
                </span>
              </div>
            )}
            {job.workMode && (
              <div style={s.sideRow}>
                <span style={s.sideLabel}>Work Mode</span>
                <span style={s.sideVal}>{job.workMode}</span>
              </div>
            )}
            {job.experienceLevel && (
              <div style={s.sideRow}>
                <span style={s.sideLabel}>Experience</span>
                <span style={s.sideVal}>{job.experienceLevel}</span>
              </div>
            )}
            {job.deadline && (
              <div style={s.sideRow}>
                <span style={s.sideLabel}>Deadline</span>
                <span style={s.sideVal}>{new Date(job.deadline).toLocaleDateString()}</span>
              </div>
            )}
            {job.createdAt && (
              <div style={s.sideRow}>
                <span style={s.sideLabel}>Posted</span>
                <span style={s.sideVal}>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </aside>
      </div>

      {modal === 'apply'  && <ApplyModal jobId={id} onClose={() => setModal(null)} />}
      {modal === 'bid'    && <BidModal   jobId={id} onClose={() => setModal(null)} />}
      {modal === 'invite' && <InviteFreelancerModal jobId={id} onClose={() => setModal(null)} />}
    </div>
  );
}

const s = {
  page:        { maxWidth: 1100, margin: '0 auto', padding: '1.75rem 1.5rem' },
  back:        { display: 'inline-block', color: '#6B7280', fontSize: '0.875rem', marginBottom: '1.25rem' },
  layout:      { display: 'flex', gap: '1.5rem', alignItems: 'flex-start' },
  main:        { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1rem' },
  sidebar:     { width: 260, flexShrink: 0, position: 'sticky', top: 80 },

  header:      { padding: '1.5rem' },
  headerInner: { display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' },
  badges:      { display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' },
  title:       { fontSize: '1.6rem', fontWeight: 700, color: '#111827', margin: '0 0 0.2rem' },
  company:     { color: '#6B7280', fontSize: '0.95rem', margin: 0 },
  metaRow:     { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' },
  metaChip:    { fontSize: '0.8rem', padding: '3px 10px', background: '#F3F4F6', borderRadius: 999, color: '#374151' },
  actions:     { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },

  section:     { padding: '1.5rem' },
  sectionTitle:{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '0.875rem' },
  description: { lineHeight: 1.75, color: '#374151', fontSize: '0.95rem' },
  skills:      { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },

  sideTitle:   { fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' },
  sideRow:     { display: 'flex', flexDirection: 'column', gap: '0.1rem', marginBottom: '0.875rem' },
  sideLabel:   { fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' },
  sideVal:     { fontSize: '0.9rem', fontWeight: 600, color: '#111827' },
};
