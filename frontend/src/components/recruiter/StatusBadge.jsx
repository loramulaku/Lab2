const CLS = {
  open:      'bg-green-100 text-green-800',
  draft:     'bg-gray-100 text-gray-600',
  closed:    'bg-gray-200 text-gray-700',
  archived:  'bg-gray-100 text-gray-400',
  pending:   'bg-yellow-100 text-yellow-800',
  accepted:  'bg-green-100 text-green-800',
  rejected:  'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
  expired:   'bg-gray-100 text-gray-500',
  revoked:   'bg-gray-100 text-gray-500',
  active:    'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  past_due:  'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2 py-0.5 font-medium whitespace-nowrap ${CLS[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
