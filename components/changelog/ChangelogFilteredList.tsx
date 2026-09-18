'use client';

import { useState } from 'react';
import { type ChangelogEntryData } from '@/components/changelog/ChangelogEntry';
import ChangelogList from '@/components/changelog/ChangelogList';
import YearFilter from '@/components/changelog/YearFilter';

interface ChangelogFilteredListProps {
  /** All changelog entries, pre-sorted newest-first by the server page. */
  entries: ChangelogEntryData[];
}

/**
 * Client wrapper that owns the year-filter state, derives the year list from
 * the supplied entries, filters before passing to ChangelogList, and renders
 * the entry count and filter control above the list.
 *
 * This component is a 'use client' boundary so that useState-based interactivity
 * can live in a child of the server ChangelogPage component.
 */
export default function ChangelogFilteredList({ entries }: ChangelogFilteredListProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Derive sorted-unique year list from entries, newest year first.
  // Year extraction relies on the ISO 8601 date convention in data/changelog.json.
  const years = Array.from(
    new Set(entries.map((e) => new Date(e.date).getUTCFullYear()))
  ).sort((a, b) => b - a);

  // Filter preserves the newest-first order supplied by the server page.
  const filtered =
    selectedYear === null
      ? entries
      : entries.filter((e) => new Date(e.date).getUTCFullYear() === selectedYear);

  const countText =
    filtered.length === 1 ? '1 entry' : `${filtered.length} entries`;

  return (
    <>
      <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
        {countText}
      </p>
      <YearFilter
        years={years}
        selected={selectedYear}
        onChange={setSelectedYear}
      />
      <ChangelogList entries={filtered} />
    </>
  );
}
