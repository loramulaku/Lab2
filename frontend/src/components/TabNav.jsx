export default function TabNav({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-gray-100 px-6">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`py-4 px-4 text-sm font-medium border-b-2 transition -mb-px ${
            active === tab
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
