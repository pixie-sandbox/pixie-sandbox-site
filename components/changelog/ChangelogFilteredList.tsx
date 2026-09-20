'use client';

import { useState } from 'react';
import { type ChangelogEntryData } from '@/components/changelog/ChangelogEntry';
import ChangelogList from '@/components/changelog/ChangelogList';
import TitleSearch from '@/components/changelog/TitleSearch';
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
  const [searchQuery, setSearchQuery] = useState('');

  // Derive per-year counts and sorted-unique year list from entries, newest year first.
  // Year extraction relies on the ISO 8601 date convention in data/changelog.json.
  // Counts are derived inline from the same entries array to stay in sync with the list.
  const yearCountMap: Record<number, number> = {};
  for (const e of entries) {
    const y = new Date(e.date).getUTCFullYear();
    yearCountMap[y] = (yearCountMap[y] ?? 0) + 1;
  }
  const years = Object.keys(yearCountMap)
    .map(Number)
    .sort((a, b) => b - a)
    .map((year) => ({ year, count: yearCountMap[year] }));
  const totalCount = entries.length;

  // Apply year filter first, then title search. Both conditions must match (AND).
  // Whitespace-only search is treated as empty — no additional filtering applied.
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filtered = entries.filter((e) => {
    const yearMatch =
      selectedYear === null || new Date(e.date).getUTCFullYear() === selectedYear;
    const searchMatch =
      trimmedQuery === '' || e.title.toLowerCase().includes(trimmedQuery);
    return yearMatch && searchMatch;
  });

  const countText =
    filtered.length === 1 ? '1 entry' : `${filtered.length} entries`;

  return (
    <>
      <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
        {countText}
      </p>
      <div className="flex items-center gap-4">
        <TitleSearch value={searchQuery} onChange={setSearchQuery} />
        <YearFilter
          years={years}
          totalCount={totalCount}
          selected={selectedYear}
          onChange={setSelectedYear}
        />
      </div>
      {filtered.length === 0 ? (
        <p>No entries match.</p>
      ) : (
        <ChangelogList entries={filtered} />
      )}
    </>
  );
}
