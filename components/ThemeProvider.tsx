'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Provides theme state (light | dark) and a toggleTheme function to the
 * component tree. The initial state is synchronised on mount with the class
 * the blocking inline script has already applied to <html>, which means the
 * React state tracks whatever the page is actually showing.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Start with 'light' – the blocking script has already set the correct class
  // on <html> before paint, so no visual flash occurs even if React's initial
  // state differs.
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Sync React state with the class the blocking script applied.
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
