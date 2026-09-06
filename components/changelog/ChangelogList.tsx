import ChangelogEntry, { type ChangelogEntryData } from "./ChangelogEntry";

interface ChangelogListProps {
  /** Entries pre-sorted in descending chronological order (newest first). */
  entries: ChangelogEntryData[];
}

/**
 * Renders an ordered list of changelog entries.
 * Sorting is the responsibility of the caller (page.tsx).
 */
export default function ChangelogList({ entries }: ChangelogListProps) {
  return (
    <div
      role="feed"
      aria-label="Changelog entries"
      className="flex flex-col"
    >
      {entries.map((entry) => (
        <ChangelogEntry key={entry.date} entry={entry} />
      ))}
    </div>
  );
}
