import { useEffect, useMemo, useRef, useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function SkillSelector({
  selectedSkills = [],
  onChange,
  availableSkills = [],
  placeholder = 'Search skills…',
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedNames = useMemo(
    () => new Set(selectedSkills.map((s) => s.name?.toLowerCase())),
    [selectedSkills]
  );

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return availableSkills
      .filter((name) => !selectedNames.has(name.toLowerCase()))
      .filter((name) => !q || name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [availableSkills, query, selectedNames]);

  const addSkill = (name) => {
    onChange([...selectedSkills, { name, level: 'Intermediate' }]);
    setQuery('');
    setOpen(false);
  };

  const removeSkill = (name) => {
    onChange(selectedSkills.filter((s) => s.name !== name));
  };

  const updateLevel = (name, level) => {
    onChange(selectedSkills.map((s) => (s.name === name ? { ...s, level } : s)));
  };

  return (
    <div ref={containerRef} className="space-y-3">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {open && suggestions.length > 0 && (
          <ul className="absolute z-50 left-0 right-0 top-full mt-1 border border-gray-200 bg-white rounded-md shadow-md max-h-48 overflow-y-auto">
            {suggestions.map((name) => (
              <li
                key={name}
                onMouseDown={() => addSkill(name)}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedSkills.length > 0 && (
        <ul className="space-y-2">
          {selectedSkills.map(({ name, level }) => (
            <li
              key={name}
              className="flex items-center gap-3 border border-gray-200 rounded-md px-3 py-2 bg-white"
            >
              <span className="text-sm font-medium text-gray-900 flex-1">{name}</span>
              <select
                value={level}
                onChange={(e) => updateLevel(name, e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-700"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <input
                type="range"
                min={0}
                max={3}
                value={LEVELS.indexOf(level)}
                onChange={(e) => updateLevel(name, LEVELS[Number(e.target.value)])}
                className="w-20 accent-blue-600"
                aria-label={`${name} proficiency`}
              />
              <button
                type="button"
                onClick={() => removeSkill(name)}
                className="text-gray-400 hover:text-gray-600"
                aria-label={`Remove ${name}`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
