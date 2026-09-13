import BackToTop from './BackToTop';
import changelog from '@/data/changelog.json';

type ChangelogEntry = { date: string; title: string; description: string };

/** Returns the entry with the most recent date, or null if the array is empty. */
function getLatestEntry(entries: ChangelogEntry[]): ChangelogEntry | null {
  if (entries.length === 0) return null;
  return entries.reduce((latest, entry) =>
    new Date(entry.date) > new Date(latest.date) ? entry : latest
  );
}

/**
 * Formats an ISO 8601 date string as 'DD MMM YYYY'
 * (e.g. '2026-08-29T00:00:00.000Z' → '29 Aug 2026').
 * Parses the date portion directly to avoid timezone-offset shifts.
 */
function formatDate(isoString: string): string {
  const [year, month, day] = isoString.slice(0, 10).split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function Footer() {
  const year = new Date().getFullYear();
  const latestEntry = getLatestEntry(changelog as ChangelogEntry[]);

  return (
    <footer className="w-full py-6 px-8 border-t border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span>&copy; {year}</span>
          <span>&middot;</span>
          <a
            href="https://github.com/pixie-sandbox/pixie-sandbox-site"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View the Pixie sandbox site source code on GitHub"
            className="inline-flex items-center gap-1.5 font-medium text-zinc-950 dark:text-zinc-50 hover:underline"
          >
            <svg
              aria-hidden="true"
              height="16"
              width="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
          <BackToTop />
        </div>
        {latestEntry && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Last updated: {formatDate(latestEntry.date)}
          </p>
        )}
      </div>
    </footer>
  );
}
