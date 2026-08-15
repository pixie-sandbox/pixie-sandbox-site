'use client';

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Module-level pub-sub for theme changes.
//
// Listeners are registered by useSyncExternalStore and called explicitly from
// toggleTheme (inside the React event handler) so React's scheduler sees the
// update as part of the current batch – avoiding "not wrapped in act" warnings
// and ensuring synchronous snapshot propagation.
// ---------------------------------------------------------------------------
type Listener = () => void;
const themeListeners = new Set<Listener>();

function subscribe(callback: Listener): () => void {
  themeListeners.add(callback);
  return () => themeListeners.delete(callback);
}

/** Read the current theme from the DOM class applied by the anti-FOUC script. */
function getTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/** Server-side snapshot – the blocking script will correct this before paint. */
function getServerTheme(): Theme {
  return 'light';
}

/**
 * Provides theme state (light | dark) and a toggleTheme function to the
 * component tree. Uses useSyncExternalStore so the theme is derived directly
 * from the DOM class set by the anti-FOUC blocking script in layout.tsx – no
 * setState inside an effect, no cascading renders.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  const toggleTheme = useCallback(() => {
    const next: Theme = document.documentElement.classList.contains('dark')
      ? 'light'
      : 'dark';
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    // Notify listeners from within the React event handler so the update is
    // batched correctly and remains inside any enclosing act() boundary.
    themeListeners.forEach((fn) => fn());
  }, []);

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
