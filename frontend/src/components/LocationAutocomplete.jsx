import { useEffect, useRef, useState } from 'react';

/**
 * Location autocomplete backed by OpenStreetMap Nominatim (no API key needed).
 * Debounces requests by 300 ms; shows dropdown only after 3+ characters.
 *
 * Props:
 *   value       string   – controlled value
 *   onChange    fn(str)  – called on every keystroke AND on suggestion select
 *   placeholder string   – input placeholder (default: "e.g. New York, NY")
 *   className   string   – extra class(es) applied to the <input> element
 */
export default function LocationAutocomplete({ value, onChange, placeholder = 'e.g. New York, NY', className = '', inputClassName }) {
  const [query,       setQuery]       = useState(value ?? '');
  const [suggestions, setSuggestions] = useState([]);
  const [open,        setOpen]        = useState(false);
  const debounceRef                   = useRef(null);
  const containerRef                  = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handle = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Keep local query in sync when parent value changes
  useEffect(() => { setQuery(value ?? ''); }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    clearTimeout(debounceRef.current);
    if (val.trim().length < 3) { setSuggestions([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5`,
          { headers: { 'Accept-Language': 'en' } },
        );
        const data = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 300);
  };

  const handleSelect = (displayName) => {
    setQuery(displayName);
    onChange(displayName);
    setSuggestions([]);
    setOpen(false);
  };

  const cls = inputClassName
    ?? `w-full border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`;

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={cls}
      />
      {open && (
        <ul className="absolute z-50 left-0 right-0 top-full border border-gray-200 bg-white shadow-md max-h-52 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onMouseDown={() => handleSelect(s.display_name)}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
