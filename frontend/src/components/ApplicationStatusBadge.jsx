const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  reviewed: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function ApplicationStatusBadge({ status }) {
  const key = status?.toLowerCase() ?? 'pending';
  const styles = STATUS_STYLES[key] ?? 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles}`}>
      {status ?? 'pending'}
    </span>
  );
}

export { STATUS_STYLES };
