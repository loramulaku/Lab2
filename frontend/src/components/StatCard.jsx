export default function StatCard({ icon, value, label }) {
  return (
    <div className="surface p-4 flex items-center gap-3">
      <span className="text-brand-600">{icon}</span>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
