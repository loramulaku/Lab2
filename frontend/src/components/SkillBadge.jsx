const COLOR_MAP = {
  react:      'bg-green-100 text-green-700',
  'node.js':  'bg-green-100 text-green-700',
  nodejs:     'bg-green-100 text-green-700',
  typescript: 'bg-purple-100 text-purple-700',
  postgresql: 'bg-pink-100 text-pink-700',
  docker:     'bg-slate-100 text-slate-600',
  aws:        'bg-blue-100 text-blue-700',
};

const LEVEL_DOTS = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };

function DotRating({ level }) {
  const filled = LEVEL_DOTS[level] ?? 2;
  return (
    <span className="flex gap-1 items-center">
      {[1, 2, 3, 4].map(i => (
        <span key={i} className={`w-2.5 h-2.5 rounded-full ${i <= filled ? 'bg-blue-600' : 'bg-gray-200'}`} />
      ))}
    </span>
  );
}

export default function SkillBadge({ name, level, compact = false }) {
  const color = COLOR_MAP[name?.toLowerCase()] ?? 'bg-indigo-100 text-indigo-700';
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 text-sm font-medium ${color} ${compact ? '' : 'rounded-none'}`}>
      {name}
      {level && <DotRating level={level} />}
    </span>
  );
}
