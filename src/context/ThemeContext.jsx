import { createContext, useContext, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

export const THEMES = [
  { id: 'midnight', label: 'Midnight', dot: '#3b82f6' },
  { id: 'aurora', label: 'Aurora', dot: '#8b5cf6' },
  { id: 'sunset', label: 'Sunset', dot: '#f97316' },
  { id: 'paper', label: 'Paper', dot: '#d1d5db' },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [prefs, setPrefs] = useLocalStorage('ds:theme', { theme: 'midnight', compact: false });
  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme;
    document.documentElement.dataset.density = prefs.compact ? 'compact' : 'comfortable';
  }, [prefs]);
  const value = {
    ...prefs,
    setTheme: (theme) => setPrefs((p) => ({ ...p, theme })),
    toggleCompact: () => setPrefs((p) => ({ ...p, compact: !p.compact })),
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
