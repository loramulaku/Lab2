export default function TabNav({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-gray-100 px-6">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={active === tab ? 'tab-link-active' : 'tab-link'}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
