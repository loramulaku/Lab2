import { useEffect, useRef, useState } from 'react';

const SearchBar = ({ onSearch, placeholder = 'Search...', className = '', delay = 300 }) => {
  const [value, setValue] = useState('');
  const timer = useRef(null);

  const handleChange = (e) => {
    const next = e.target.value;
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(next), delay);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleSubmit = (e) => e.preventDefault();

  return (
    <form onSubmit={handleSubmit} className={`flex items-center ${className}`}>
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </div>
    </form>
  );
};

export default SearchBar;
