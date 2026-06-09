import { useCallback, useState } from 'react';

// Dark mode is driven by the `dark` class on <html> (Tailwind's class strategy).
// The initial class is set in index.html before paint; this hook just reads it
// and lets components toggle + persist the choice.
export function useDarkMode() {
  const [dark, setDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  const toggle = useCallback(() => {
    setDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return [dark, toggle];
}

export default useDarkMode;
