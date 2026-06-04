import { useState } from 'react';

/**
 * Reusable bid submission modal (Mode A — public freelance jobs).
 * Collects: offered price, estimated completion time (days), optional message.
 *
 * Props:
 *   job      : { id, title } the freelance job being bid on
 *   onSubmit : ({ price, deliveryTimeDays, message }) => Promise
 *   onClose  : () => void
 */
export default function BidModal({ job, onSubmit, onClose }) {
  const [price, setPrice]               = useState('');
  const [deliveryTimeDays, setDelivery] = useState('');
  const [message, setMessage]           = useState('');
  const [error, setError]               = useState('');
  const [submitting, setSubmitting]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const p = Number(price);
    const d = Number(deliveryTimeDays);
    if (!(p > 0) || !(d > 0)) {
      setError('Price and delivery time must be positive numbers.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({ price: p, deliveryTimeDays: d, message: message.trim() || undefined });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit bid.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onMouseDown={onClose}>
      <div className="bg-white w-full max-w-md border border-gray-200 shadow-xl" onMouseDown={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Submit a Bid</h3>
          <p className="text-sm text-gray-500 truncate">{job.title}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offered price ($)</label>
              <input type="number" min="1" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 1500" autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Completion (days)</label>
              <input type="number" min="1" value={deliveryTimeDays} onChange={e => setDelivery(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 14" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
            <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Briefly introduce yourself and your approach…" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Submitting…' : 'Submit Bid'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
