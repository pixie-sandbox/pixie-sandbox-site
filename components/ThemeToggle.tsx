'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from './ThemeProvider';

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/**
 * useSyncExternalStore with a no-op subscription and asymmetric snapshots is
 * the React-idiomatic way to detect server vs. client rendering without calling
 * setState inside an effect. getServerSnapshot returns false; getSnapshot
 * (client) returns true – so `mounted` flips to true on the first client render
 * with zero extra renders and no hydration mismatch.
 */
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},   // subscribe – nothing to listen to, store never changes
    () => true,       // getSnapshot (client)
    () => false,      // getServerSnapshot (server / SSR)
  );
}

/**
 * Icon-based toggle that switches between light and dark themes. Defers
 * rendering the icon until after client-side mounting to avoid hydration
 * mismatches caused by server/client theme discrepancy.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const mounted = useMounted();

  // Render a same-size placeholder on the server and during initial
  // client paint to prevent layout shift and hydration errors.
  if (!mounted) {
    return <div className="w-9 h-9" aria-hidden="true" />;
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      }
      className="flex items-center justify-center w-9 h-9 rounded-full text-zinc-600 hover:text-zinc-950 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-white/[.06] transition-colors"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
