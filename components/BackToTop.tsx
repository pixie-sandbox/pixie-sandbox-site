'use client';

import { useState, useEffect } from 'react';

/**
 * Upward-pointing chevron icon, matching the inline-SVG style used by
 * ThemeToggle (no external icon library dependency).
 */
function ChevronUpIcon() {
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
      <path d="M18 15l-6-6-6 6" />
    </svg>
  );
}

/**
 * Back-to-top button that lives inside the site footer.
 *
 * Visibility rules (both must be true):
 *  1. The page content is taller than the viewport (page is scrollable).
 *  2. The user has scrolled at least 1 pixel from the top.
 *
 * Returns null when hidden so it is fully absent from the DOM (AC1/AC2).
 * The scroll listener is registered as passive to avoid blocking the main
 * thread (performance constraint).
 */
export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function checkVisibility() {
      const isPageScrollable =
        document.documentElement.scrollHeight > window.innerHeight;
      const isScrolled = window.scrollY > 0;
      setIsVisible(isPageScrollable && isScrolled);
    }

    // Evaluate immediately so the initial render reflects real state.
    checkVisibility();

    window.addEventListener('scroll', checkVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', checkVisibility);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="flex items-center justify-center w-9 h-9 rounded-full text-zinc-600 hover:text-zinc-950 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-white/[.06] transition-colors"
    >
      <ChevronUpIcon />
    </button>
  );
}
