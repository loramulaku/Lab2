import { useEffect, useState } from 'react';
import candidateService from '../../services/candidateService';

/**
 * Freelancer bid form (Mode A / C — biddable freelance jobs).
 *
 * Everything we can pull from the profile (skills, portfolio links) is PREFILLED
 * and editable; the freelancer only fills the offer specifics. The proposed
 * amount is shown next to the job's budget for context.
 *
 * Props:
 *   job      : { id, title, budgetMin, budgetMax, skills }
 *   onSubmit : (payload) => Promise   — caller posts to /jobs/:id/bids
 *   onClose  : () => void
 */
const inputCls = 'w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

function fmtBudget(job) {
  const lo = job.budgetMin, hi = job.budgetMax;
  if (lo && hi) return `$${Number(lo).toLocaleString()}–$${Number(hi).toLocaleString()}`;
  if (lo) return `from $${Number(lo).toLocaleString()}`;
  if (hi) return `up to $${Number(hi).toLocaleString()}`;
  return 'not specified';
}

export default function BidModal({ job, onSubmit, onClose }) {
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [form, setForm] = useState({
    bidType: 'fixed', price: '', deliveryTimeDays: '',
    message: '', skills: [],
    portfolioLinks: [''], milestones: [],
    hoursPerWeek: '', startDate: '', terms: false,
  });

  // Prefill skills + portfolio links from the profile.
  useEffect(() => {
    candidateService.getProfile()
      .then(p => setForm(f => ({
        ...f,
        skills: (p.skills ?? []).map(s => s.name),
        portfolioLinks: [p.portfolioUrl, p.githubUrl, p.linkedinUrl].filter(Boolean).length
          ? [p.portfolioUrl, p.githubUrl, p.linkedinUrl].filter(Boolean)
          : [''],
      })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set    = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setVal = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const removeSkill = (name) => setForm(p => ({ ...p, skills: p.skills.filter(s => s !== name) }));

  const setLink    = (i, v) => setForm(p => ({ ...p, portfolioLinks: p.portfolioLinks.map((l, idx) => idx === i ? v : l) }));
  const addLink    = ()     => setForm(p => ({ ...p, portfolioLinks: [...p.portfolioLinks, ''] }));
  const removeLink = (i)    => setForm(p => ({ ...p, portfolioLinks: p.portfolioLinks.filter((_, idx) => idx !== i) }));

  const addMilestone    = ()        => setForm(p => ({ ...p, milestones: [...p.milestones, { phase: '', price: '', deadline: '' }] }));
  const setMilestone    = (i, k, v) => setForm(p => ({ ...p, milestones: p.milestones.map((m, idx) => idx === i ? { ...m, [k]: v } : m) }));
  const removeMilestone = (i)       => setForm(p => ({ ...p, milestones: p.milestones.filter((_, idx) => idx !== i) }));

  const jobSkills = (job.skills ?? []).map(s => s.toLowerCase());

  const submit = async (e) => {
    e.preventDefault();
    const price = Number(form.price);
    const days  = Number(form.deliveryTimeDays);
    if (!(price > 0))           { setError('Enter a valid offer amount.'); return; }
    if (!(days > 0))            { setError('Enter a valid delivery time (days).'); return; }
    if (!form.message.trim())   { setError('A short proposal message is required.'); return; }
    if (!form.terms)            { setError('Please accept the terms to submit your bid.'); return; }
    setError(''); setSubmitting(true);
    try {
      await onSubmit({
        bidType:          form.bidType,
        price,
        deliveryTimeDays: days,
        message:          form.message.trim(),
        hoursPerWeek:     form.hoursPerWeek !== '' ? Number(form.hoursPerWeek) : null,
        startDate:        form.startDate || null,
        skillsSnapshot:   form.skills,
        portfolioLinks:   form.portfolioLinks.map(l => l.trim()).filter(Boolean),
        milestones:       form.milestones
          .filter(m => m.phase.trim() || m.price || m.deadline)
          .map(m => ({ phase: m.phase.trim(), price: m.price !== '' ? Number(m.price) : null, deadline: m.deadline || null })),
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit bid.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onMouseDown={onClose}>
      <div className="bg-white w-full max-w-xl border border-gray-200 shadow-xl flex flex-col max-h-[90vh]"
        onMouseDown={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex-shrink-0 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">Submit a Bid — {job.title}</h3>
            <p className="text-xs text-gray-500">Budget: {fmtBudget(job)}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-gray-400">Loading…</div>
        ) : (
          <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* ── Financial offer ──────────────────────────────────── */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Your offer <span className="text-red-500">*</span></h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Type</label>
                    <div className="flex">
                      {['fixed', 'hourly'].map((t, i) => (
                        <button key={t} type="button" onClick={() => setVal('bidType', t)}
                          className={`flex-1 py-2 text-xs font-medium border capitalize ${i === 1 ? 'border-l-0' : ''} ${
                            form.bidType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                          {t === 'fixed' ? 'Fixed price' : 'Hourly rate'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>{form.bidType === 'hourly' ? 'Rate ($/hr)' : 'Amount ($)'}</label>
                    <input type="number" min="1" value={form.price} onChange={set('price')} className={inputCls}
                      placeholder={form.bidType === 'hourly' ? 'e.g. 35' : 'e.g. 1200'} autoFocus />
                  </div>
                </div>
              </section>

              {/* ── Timeline ─────────────────────────────────────────── */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Timeline <span className="text-red-500">*</span></h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Delivery time (days)</label>
                    <input type="number" min="1" value={form.deliveryTimeDays} onChange={set('deliveryTimeDays')} className={inputCls} placeholder="e.g. 14" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={labelCls + ' mb-0'}>Milestones <span className="text-gray-400">(optional)</span></span>
                    <button type="button" onClick={addMilestone} className="text-xs text-indigo-600 hover:underline">+ Add milestone</button>
                  </div>
                  {form.milestones.map((m, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={m.phase} onChange={e => setMilestone(i, 'phase', e.target.value)} className={inputCls} placeholder="Phase" />
                      <input type="number" min="0" value={m.price} onChange={e => setMilestone(i, 'price', e.target.value)} className="w-24 border border-gray-300 px-2 py-2 text-sm" placeholder="$" />
                      <input type="date" value={m.deadline} onChange={e => setMilestone(i, 'deadline', e.target.value)} className="w-40 border border-gray-300 px-2 py-2 text-sm" />
                      <button type="button" onClick={() => removeMilestone(i)} className="text-gray-400 hover:text-gray-700 px-1">×</button>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Proposal ─────────────────────────────────────────── */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Proposal <span className="text-red-500">*</span></h4>
                <textarea rows={3} value={form.message} onChange={set('message')} className={`${inputCls} resize-none`}
                  placeholder="Why you, and how you'd approach this project…" />
                {form.skills.length > 0 && (
                  <div>
                    <label className={labelCls}>Relevant skills <span className="text-gray-400">(✓ = matches this job)</span></label>
                    <div className="flex flex-wrap gap-1.5">
                      {form.skills.map(s => {
                        const match = jobSkills.includes(s.toLowerCase());
                        return (
                          <span key={s} className={`flex items-center gap-1 text-xs px-2 py-1 border ${
                            match ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            {match && '✓'} {s}
                            <button type="button" onClick={() => removeSkill(s)} className="text-gray-400 hover:text-gray-700 leading-none">×</button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              {/* ── Portfolio ────────────────────────────────────────── */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Portfolio</h4>
                  <button type="button" onClick={addLink} className="text-xs text-indigo-600 hover:underline">+ Add link</button>
                </div>
                {form.portfolioLinks.map((l, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={l} onChange={e => setLink(i, e.target.value)} className={inputCls} placeholder="https://… (similar work)" />
                    {form.portfolioLinks.length > 1 && (
                      <button type="button" onClick={() => removeLink(i)} className="text-gray-400 hover:text-gray-700 px-1">×</button>
                    )}
                  </div>
                ))}
              </section>

              {/* ── Availability ─────────────────────────────────────── */}
              <section className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Hours per week</label>
                  <input type="number" min="1" max="168" value={form.hoursPerWeek} onChange={set('hoursPerWeek')} className={inputCls} placeholder="e.g. 20" />
                </div>
                <div>
                  <label className={labelCls}>Start date</label>
                  <input type="date" value={form.startDate} onChange={set('startDate')} className={inputCls} />
                </div>
              </section>

              {/* ── Consent ──────────────────────────────────────────── */}
              <label className="flex items-start gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={form.terms} onChange={e => setVal('terms', e.target.checked)} className="h-4 w-4 mt-0.5" />
                I accept the bidding terms and confirm my offer is accurate.
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-100 px-5 py-3 flex items-center gap-3 bg-white">
              <button type="submit" disabled={submitting}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {submitting ? 'Submitting…' : 'Submit Bid'}
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
