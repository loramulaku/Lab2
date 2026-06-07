const colorClasses = {
  blue:   'bg-blue-100 text-blue-600',
  green:  'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  red:    'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
};

const StatCard = ({ title, label, value, icon, color = 'blue', compact = false }) => {
  const displayTitle = title ?? label;
  if (compact) {
    return (
      <div className="bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
        <span className="text-blue-500">{icon}</span>
        <div>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{displayTitle}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{displayTitle}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
