export default function GlobalColorsPanel({ config, onChange }) {
  return (
    <div className="p-5 space-y-5">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Colors</p>
      <p className="text-xs text-gray-400 leading-relaxed -mt-2">
        Site-wide tokens. Select a section in the preview to edit page content.
      </p>
      <div className="space-y-3">
        {Object.entries(config.colors ?? {}).map(([key, value]) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <div className="flex items-center gap-2">
              <input type="color" value={value} onChange={e => onChange('colors', key, e.target.value)}
                className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
              <input type="text" value={value} onChange={e => onChange('colors', key, e.target.value)}
                className="flex-1 px-2.5 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        ))}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Font Family</p>
        <input type="text" value={config.fonts?.primary ?? ''}
          onChange={e => onChange('fonts', 'primary', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" />
      </div>
    </div>
  );
}
