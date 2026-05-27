export default function DashboardStatCard({ label, value, trend, icon: Icon, loading }) {
  const trendUp = trend > 0;
  const trendDown = trend < 0;
  const trendNeutral = trend === 0 || trend == null;

  const trendText = trendNeutral
    ? '→ 0%'
    : `${trendUp ? '↑' : '↓'} ${Math.abs(trend)}%`;

  const trendClass = trendUp
    ? 'text-green-600'
    : trendDown
      ? 'text-red-600'
      : 'text-gray-500';

  return (
    <div className="surface p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          {loading ? (
            <div className="h-9 w-16 bg-gray-100 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">
              {value.toLocaleString()}
            </p>
          )}
          {!loading && (
            <p className={`text-sm font-medium mt-2 ${trendClass}`}>
              {trendText}
              <span className="text-gray-400 font-normal ml-1">vs prior period</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
