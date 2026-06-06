import { useEffect, useState } from 'react';
import candidateService from '../../services/candidateService';

/**
 * Candidate application form for STANDARD-employment jobs.
 *
 * Everything we already know about the candidate is pulled from their profile
 * and shown PREFILLED + editable — they only fill what we don't have. On submit
 * the reusable fields (phone, location, links, years, relocate) are saved back
 * to the profile so the next application is even more prefilled.
 *
 * Props:
 *   job      : the job being applied to (uses job.skills for skill matching,
 *              job.screeningQuestions when present)
 *   onSubmit : (payload) => Promise   — caller posts to /candidate/applications
 *   onClose  : () => void
 */
const inputCls = 'w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';
const fileName = (p) => (p ? p.split('/').pop() : null);

export default function ApplicationForm({ job, onSubmit, onClose }) {
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [error, setError]             = useState('');
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', location: '', willingToRelocate: false,
    cvPath: null, coverLetter: '',
    linkedinUrl: '', githubUrl: '', portfolioUrl: '',
    yearsExperience: '', availableFrom: '', expectedSalary: '',
    skills: [], gdpr: false, screeningAnswers: {},
  });

  // Prefill from the candidate profile.
  useEffect(() => {
    candidateService.getProfile()
      .then(p => setForm(f => ({
        ...f,
        fullName:          [p.firstName, p.lastName].filter(Boolean).join(' '),
        email:             p.email ?? '',
        phone:             p.phone ?? '',
        location:          p.location ?? '',
        willingToRelocate: !!p.willingToRelocate,
        cvPath:            p.cvPath ?? null,
        linkedinUrl:       p.linkedinUrl ?? '',
        githubUrl:         p.githubUrl ?? '',
        portfolioUrl:      p.portfolioUrl ?? '',
        yearsExperience:   p.yearsExperience ?? '',
        skills:            (p.skills ?? []).map(s => s.name),
      })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set    = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setVal = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const removeSkill = (name) => setForm(p => ({ ...p, skills: p.skills.filter(s => s !== name) }));

  const jobSkills = (job.skills ?? []).map(s => s.toLowerCase());
  const screening = Array.isArray(job.screeningQuestions) ? job.screeningQuestions : [];

  const handleCv = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCv(true); setError('');
    try {
      const { path } = await candidateService.uploadCv(file);
      setVal('cvPath', path);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to upload CV.');
    } finally {
      setUploadingCv(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.cvPath) { setError('A CV / resume is required to apply.'); return; }
    if (!form.gdpr)   { setError('Please accept the data-processing consent to continue.'); return; }
    setError(''); setSubmitting(true);
    try {
      await onSubmit({
        coverLetter:       form.coverLetter.trim() || null,
        expectedSalary:    form.expectedSalary !== '' ? Number(form.expectedSalary) : null,
        availableFrom:     form.availableFrom || null,
        cvPath:            form.cvPath,
        phone:             form.phone.trim() || null,
        location:          form.location.trim() || null,
        willingToRelocate: form.willingToRelocate,
        yearsExperience:   form.yearsExperience !== '' ? Number(form.yearsExperience) : null,
        linkedinUrl:       form.linkedinUrl.trim() || null,
        githubUrl:         form.githubUrl.trim() || null,
        portfolioUrl:      form.portfolioUrl.trim() || null,
        skillsSnapshot:    form.skills,
        screeningAnswers:  screening.length ? form.screeningAnswers : null,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit application.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onMouseDown={onClose}>
      <div className="bg-white w-full max-w-2xl border border-gray-200 shadow-xl flex flex-col max-h-[90vh]"
        onMouseDown={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex-shrink-0 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">Apply — {job.title}</h3>
            <p className="text-xs text-gray-500 truncate">{job.company?.name}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-gray-400">Loading your details…</div>
        ) : (
          <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-3 py-2">
                We've prefilled everything from your profile — review, edit anything, and add what's missing.
              </p>

              {/* ── Personal ─────────────────────────────────────────── */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Personal info</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Full name</label>
                    <input value={form.fullName} onChange={set('fullName')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" value={form.email} onChange={set('email')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input value={form.phone} onChange={set('phone')} className={inputCls} placeholder="e.g. +383 44 123 456" />
                  </div>
                  <div>
                    <label className={labelCls}>Current location</label>
                    <input value={form.location} onChange={set('location')} className={inputCls} placeholder="City, Country" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={form.willingToRelocate}
                    onChange={e => setVal('willingToRelocate', e.target.checked)} className="h-4 w-4" />
                  Willing to relocate
                </label>
              </section>

              {/* ── Documents ────────────────────────────────────────── */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Documents</h4>
                <div>
                  <label className={labelCls}>CV / Resume <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-3">
                    <label className="px-3 py-2 border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                      {uploadingCv ? 'Uploading…' : form.cvPath ? 'Replace CV' : 'Upload CV'}
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleCv} className="hidden" disabled={uploadingCv} />
                    </label>
                    {form.cvPath
                      ? <span className="text-sm text-gray-600 truncate">📄 {fileName(form.cvPath)}</span>
                      : <span className="text-xs text-gray-400">PDF or Word, up to 5 MB</span>}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Cover letter <span className="text-gray-400">(optional, recommended)</span></label>
                  <textarea rows={3} value={form.coverLetter} onChange={set('coverLetter')} className={`${inputCls} resize-none`}
                    placeholder="A few lines on why you're a great fit…" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>LinkedIn</label>
                    <input value={form.linkedinUrl} onChange={set('linkedinUrl')} className={inputCls} placeholder="linkedin.com/in/…" />
                  </div>
                  <div>
                    <label className={labelCls}>Portfolio</label>
                    <input value={form.portfolioUrl} onChange={set('portfolioUrl')} className={inputCls} placeholder="yoursite.com" />
                  </div>
                  <div>
                    <label className={labelCls}>GitHub</label>
                    <input value={form.githubUrl} onChange={set('githubUrl')} className={inputCls} placeholder="github.com/…" />
                  </div>
                </div>
              </section>

              {/* ── Application details ───────────────────────────────── */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Application details</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Years of experience</label>
                    <input type="number" min="0" value={form.yearsExperience} onChange={set('yearsExperience')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Earliest start date</label>
                    <input type="date" value={form.availableFrom} onChange={set('availableFrom')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Expected salary <span className="text-gray-400">(opt.)</span></label>
                    <input type="number" min="0" value={form.expectedSalary} onChange={set('expectedSalary')} className={inputCls} placeholder="$/yr" />
                  </div>
                </div>
                {form.skills.length > 0 && (
                  <div>
                    <label className={labelCls}>Relevant skills <span className="text-gray-400">(from your profile · ✓ = matches this job)</span></label>
                    <div className="flex flex-wrap gap-1.5">
                      {form.skills.map(s => {
                        const match = jobSkills.includes(s.toLowerCase());
                        return (
                          <span key={s} className={`flex items-center gap-1 text-xs px-2 py-1 border ${
                            match ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            {match && '✓'} {s}
                            <button type="button" onClick={() => removeSkill(s)} className="text-gray-400 hover:text-gray-700 leading-none">×</button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              {/* ── Screening questions (only when the posting has them) ── */}
              {screening.length > 0 && (
                <section className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Screening questions</h4>
                  {screening.map((q, i) => (
                    <div key={i}>
                      <label className={labelCls}>{typeof q === 'string' ? q : q.question}</label>
                      <textarea rows={2} className={`${inputCls} resize-none`}
                        value={form.screeningAnswers[i] ?? ''}
                        onChange={e => setForm(p => ({ ...p, screeningAnswers: { ...p.screeningAnswers, [i]: e.target.value } }))} />
                    </div>
                  ))}
                </section>
              )}

              {/* ── Consent ──────────────────────────────────────────── */}
              <label className="flex items-start gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={form.gdpr} onChange={e => setVal('gdpr', e.target.checked)} className="h-4 w-4 mt-0.5" />
                I consent to {job.company?.name || 'the company'} processing my personal data for this application in line with GDPR.
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-100 px-5 py-3 flex items-center gap-3 bg-white">
              <button type="submit" disabled={submitting || uploadingCv}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'Submitting…' : 'Apply'}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
