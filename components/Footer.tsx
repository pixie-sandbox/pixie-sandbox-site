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
            className="font-medium text-zinc-950 dark:text-zinc-50 hover:underline"
          >
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
