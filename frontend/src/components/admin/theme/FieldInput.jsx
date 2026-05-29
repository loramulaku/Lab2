export default function FieldInput({ field, value, onChange }) {
  if (field.type === 'color') {
    return (
      <div className="flex items-center gap-2">
        <input type="color" value={value ?? '#000000'} onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 flex-shrink-0" />
        <input type="text" value={value ?? ''} onChange={e => onChange(e.target.value)}
          className="flex-1 min-w-0 px-2.5 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" />
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} rows={3}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none resize-y min-h-[72px]" />
    );
  }

  return (
    <input type="text" value={value ?? ''} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" />
  );
}
