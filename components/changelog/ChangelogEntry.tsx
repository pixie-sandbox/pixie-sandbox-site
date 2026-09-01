import Tooltip from '@/components/ui/Tooltip';
import { calculateReadingTime } from '@/lib/readingTime';

export type ChangelogEntryData = {
  title: string;
  description: string;
  date: string; // ISO 8601
};

/**
 * Formats a past ISO 8601 date as a human-readable relative time string using
 * the built-in `Intl.RelativeTimeFormat` API (no external dependency needed).
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30);
  const diffYears = Math.round(diffDays / 365);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (diffYears >= 1) return rtf.format(-diffYears, 'year');
  if (diffMonths >= 1) return rtf.format(-diffMonths, 'month');
  if (diffWeeks >= 1) return rtf.format(-diffWeeks, 'week');
  if (diffDays >= 1) return rtf.format(-diffDays, 'day');
  if (diffHours >= 1) return rtf.format(-diffHours, 'hour');
  if (diffMinutes >= 1) return rtf.format(-diffMinutes, 'minute');
  return rtf.format(-diffSeconds, 'second');
}

/**
 * Formats an ISO 8601 date as a human-readable absolute date string for the
 * tooltip (e.g., "August 29, 2026").
 */
function formatAbsoluteDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

interface ChangelogEntryProps {
  entry: ChangelogEntryData;
}

/**
 * Renders a single changelog entry: title, description, and a relative date
 * that reveals the exact timestamp via a tooltip on hover.
 */
export default function ChangelogEntry({ entry }: ChangelogEntryProps) {
  const relativeTime = formatRelativeTime(entry.date);
  const absoluteDate = formatAbsoluteDate(entry.date);
  const readingTime = calculateReadingTime(entry.description);

  return (
    <article className="py-6 border-b border-black/[.08] dark:border-white/[.145] last:border-0">
      <header className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <div className="flex items-baseline gap-1.5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {entry.title}
          </h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {'•'} {readingTime}
          </span>
        </div>
        <Tooltip content={absoluteDate}>
          <time
            dateTime={entry.date}
            className="text-sm text-zinc-500 dark:text-zinc-400 cursor-help underline decoration-dotted underline-offset-2"
          >
            {relativeTime}
          </time>
        </Tooltip>
      </header>
      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {entry.description}
      </p>
    </article>
  );
}
