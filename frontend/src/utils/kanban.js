export const KANBAN_COLUMNS = [
  { id: 'pending', label: 'Pending', border: 'border-yellow-400' },
  { id: 'reviewed', label: 'Reviewed', border: 'border-blue-400' },
  { id: 'shortlisted', label: 'Shortlisted', border: 'border-purple-400' },
  { id: 'rejected', label: 'Rejected', border: 'border-red-400' },
  { id: 'accepted', label: 'Accepted', border: 'border-green-400' },
];

export const COLUMN_IDS = KANBAN_COLUMNS.map((c) => c.id);

export function groupByStatus(applications) {
  const groups = Object.fromEntries(COLUMN_IDS.map((id) => [id, []]));
  applications.forEach((app) => {
    const status = COLUMN_IDS.includes(app.status) ? app.status : 'pending';
    groups[status].push(app);
  });
  return groups;
}

export function candidateName(app) {
  return [app.candidateFirstName, app.candidateLastName].filter(Boolean).join(' ') || 'Candidate';
}

export function avatarColor(name) {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
