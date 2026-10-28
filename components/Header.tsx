'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { VALID_ACCOUNT_IDS } from '@/lib/accounts';

/**
 * True for the banking pages that show the signed-in strip: exactly / and
 * /accounts/<id> where id is in VALID_ACCOUNT_IDS (case-sensitive, matching
 * app/accounts/[id]/page.tsx). Not-found pages keep their browser path, so
 * /accounts/mystery, /accounts and deeper paths all return false.
 */
function isBankingPath(pathname: string): boolean {
  if (pathname === '/') return true;
  const match = /^\/accounts\/([^/]+)$/.exec(pathname);
  return match !== null && (VALID_ACCOUNT_IDS as readonly string[]).includes(match[1]);
}

/**
 * Site-wide header for Northline Bank.
 *
 * Renders:
 * - On banking pages only (/ and valid /accounts/<id>): a thin strip reading
 *   'Signed in as Alex Taylor', above the main row. The text is fixed — the
 *   demo has no authentication and always behaves as if the fictional
 *   customer Alex Taylor is signed in (see lib/accounts.ts). No sign-out.
 * - Site name 'Northline Bank' as a link to /
 * - Navigation: Accounts (/) and Changelog (/changelog)
 * - ThemeToggle
 *
 * Active nav item is indicated by a bottom border accent.
 * Mounted inside RootLayout so it appears on every page.
 */
export default function Header() {
  const pathname = usePathname();
  const showSignedIn = isBankingPath(pathname);

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
      {showSignedIn && (
        <div className="w-full bg-[var(--primary-blue-light)] dark:bg-[var(--primary-blue-light)]">
          <p className="mx-auto max-w-5xl px-6 py-1 text-xs leading-5 whitespace-nowrap overflow-hidden text-ellipsis text-[var(--primary-blue-text)] dark:text-[var(--primary-blue-text)]">
            Signed in as Alex Taylor
          </p>
        </div>
      )}
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
