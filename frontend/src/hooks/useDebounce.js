import { useEffect, useRef, useState } from 'react';

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export function useDebouncedCallback(fn, delay = 300) {
  const timer = useRef(null);
  const fnRef  = useRef(fn);
  fnRef.current = fn;

  return (...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fnRef.current(...args), delay);
  };
}
