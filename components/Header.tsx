'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

/**
 * Site-wide header for Northline Bank.
 *
 * Renders:
 * - Site name 'Northline Bank' as a link to /
 * - Navigation: Accounts (/) and Changelog (/changelog)
 * - ThemeToggle
 *
 * Active nav item is indicated by a bottom border accent.
 * Mounted inside RootLayout so it appears on every page.
 */
export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const navLinkClass = (href: string) =>
    [
      'text-sm font-medium transition-colors pb-0.5',
      isActive(href)
        ? 'border-b-2 border-[var(--primary-blue)] text-[var(--primary-blue)] dark:border-[var(--primary-blue)] dark:text-[var(--primary-blue)]'
        : 'text-zinc-600 hover:text-[var(--primary-blue)] dark:text-zinc-400 dark:hover:text-[var(--primary-blue)]',
    ].join(' ');

  return (
    <header className="w-full border-b border-black/[.08] dark:border-white/[.145] bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between gap-6">
        {/* Site name */}
        <Link
          href="/"
          className="text-base font-semibold text-[var(--primary-blue-text)] dark:text-[var(--primary-blue-text)] hover:opacity-80 transition-opacity shrink-0"
        >
          Northline Bank
        </Link>

        {/* Navigation */}
        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-6 list-none m-0 p-0">
            <li>
              <Link href="/" className={navLinkClass('/')}>
                Accounts
              </Link>
            </li>
            <li>
              <Link href="/changelog" className={navLinkClass('/changelog')}>
                Changelog
              </Link>
            </li>
          </ul>
        </nav>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
