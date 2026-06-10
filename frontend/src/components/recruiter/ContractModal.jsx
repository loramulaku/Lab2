import { useState } from 'react';
import freelanceService from '../../services/freelanceService';

/**
 * ContractModal — recruiter fills in contract terms and submits.
 *
 * Props:
 *   source        — 'bid' | 'invitation' | 'pipeline'
 *   sourceId      — bidId | invitationId | applicationId
 *   personName    — display name of the person being hired
 *   defaultPrice  — optional pre-fill for the price field
 *   context       — optional structured info to display (read-only)
 *     context.job         — { title, employmentType?, location?, salaryMin?, salaryMax? }
 *     context.bid         — { price, deliveryDays?, message? }
 *     context.invitation  — { priceOffer?, deliveryDays?, message? }
 *     context.candidate   — { phone?, email? }
 *   onClose()          — called when cancelled
 *   onCreated(contract) — called after successful creation
 */
export default function ContractModal({
  source, sourceId, personName, defaultPrice = '', context, onClose, onCreated,
}) {
  const [agreedPrice, setAgreedPrice] = useState(String(defaultPrice));
  const [startDate,   setStartDate]   = useState('');
  const [endDate,     setEndDate]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedPrice || !startDate) { setError('Price and start date are required.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const payload = { source, agreedPrice: Number(agreedPrice), startDate, endDate: endDate || null };
      if (source === 'bid')        payload.bidId         = sourceId;
      if (source === 'invitation') payload.invitationId  = sourceId;
      if (source === 'pipeline')   payload.applicationId = sourceId;
      const contract = await freelanceService.createContract(payload);
      onCreated(contract);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create contract.');
    } finally {
      setSubmitting(false);
    }
  };

  const fmtMoney = (v) => (v != null && v !== '') ? `$${Number(v).toLocaleString()}` : null;
  const isPipeline = source === 'pipeline';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-xl shadow-xl flex flex-col max-h-[90vh]"
        onMouseDown={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">Make a Contract</h2>
          {personName && (
            <p className="text-sm text-gray-500 mt-0.5">
              <span className="font-medium text-gray-700">{personName}</span>
            </p>
          )}
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">

          {/* Job details */}
          {context?.job && (
            <InfoPanel label="Job" borderClass="border-gray-200" headerClass="bg-gray-50 border-gray-200" labelClass="text-gray-400">
              <p className="text-sm font-semibold text-gray-900">{context.job.title}</p>
              {(context.job.employmentType || context.job.location || context.job.salaryMin || context.job.salaryMax) && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                  {context.job.employmentType && (
                    <span className="text-xs text-gray-500 capitalize">
                      {context.job.employmentType.replace(/_/g, ' ')}
                    </span>
                  )}
                  {context.job.location && (
                    <span className="text-xs text-gray-500">{context.job.location}</span>
                  )}
                  {(context.job.salaryMin || context.job.salaryMax) && (
                    <span className="text-xs text-gray-500">
                      {fmtMoney(context.job.salaryMin)}
                      {context.job.salaryMin && context.job.salaryMax ? ' – ' : ''}
                      {fmtMoney(context.job.salaryMax)}
                    </span>
                  )}
                </div>
              )}
            </InfoPanel>
          )}

          {/* Bid details */}
          {context?.bid && (
            <InfoPanel label="Bid Submitted" borderClass="border-blue-100" headerClass="bg-blue-50 border-blue-100" labelClass="text-blue-400">
              <div className="grid grid-cols-2 gap-3">
                {context.bid.price != null && (
                  <Field label="Proposed Price" value={fmtMoney(context.bid.price)} />
                )}
                {context.bid.deliveryDays != null && (
                  <Field label="Delivery" value={`${context.bid.deliveryDays} days`} />
                )}
              </div>
              {context.bid.message && (
                <div className="mt-2">
                  <p className="text-[11px] text-gray-400 mb-0.5">Cover Message</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{context.bid.message}</p>
                </div>
              )}
            </InfoPanel>
          )}

          {/* Invitation details */}
          {context?.invitation && (
            <InfoPanel label="Invitation Sent" borderClass="border-indigo-100" headerClass="bg-indigo-50 border-indigo-100" labelClass="text-indigo-400">
              <div className="grid grid-cols-2 gap-3">
                {context.invitation.priceOffer != null && context.invitation.priceOffer !== '' && (
                  <Field label="Offered Price" value={fmtMoney(context.invitation.priceOffer)} />
                )}
                {context.invitation.deliveryDays != null && (
                  <Field label="Duration" value={`${context.invitation.deliveryDays} days`} />
                )}
              </div>
              {context.invitation.message && (
                <div className="mt-2">
                  <p className="text-[11px] text-gray-400 mb-0.5">Message</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{context.invitation.message}</p>
                </div>
              )}
            </InfoPanel>
          )}

          {/* Candidate (pipeline) details */}
          {context?.candidate && (
            <InfoPanel label="Candidate Application" borderClass="border-green-100" headerClass="bg-green-50 border-green-100" labelClass="text-green-500">
              <div className="grid grid-cols-2 gap-3">
                {context.candidate.phone && (
                  <Field label="Phone" value={context.candidate.phone} />
                )}
                {context.candidate.email && (
                  <Field label="Email" value={context.candidate.email} />
                )}
              </div>
            </InfoPanel>
          )}

          {context && <div className="border-t border-gray-100" />}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* ── Contract terms form ── */}
          <form id="contract-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {isPipeline ? 'Salary / Compensation' : 'Agreed Price'}
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number" min="0" step="0.01"
                  value={agreedPrice} onChange={e => setAgreedPrice(e.target.value)}
                  required
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </form>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button form="contract-form" type="submit" disabled={submitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {submitting ? 'Sending…' : 'Send Contract'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoPanel({ label, borderClass, headerClass, labelClass, children }) {
  return (
    <div className={`rounded-lg border overflow-hidden ${borderClass}`}>
      <div className={`px-3.5 py-2 border-b ${headerClass}`}>
        <p className={`text-[11px] font-semibold uppercase tracking-wider ${labelClass}`}>{label}</p>
      </div>
      <div className="px-3.5 py-3 space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
